"""JSON data API for the Aztec Housing Hub prototype.

Serves housing listings, roommate profiles, and UI config.
Now backed by PostgreSQL for structured data and local JSON for UI config.
"""

import base64
import hashlib
import hmac
import json
import os
import re
import random
from datetime import datetime, timedelta
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs
from contextlib import contextmanager

from better_profanity import profanity
import psycopg2
from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 5000))
DATA_DIR = Path(__file__).parent / "data"
RED_ID_PATTERN = re.compile(r"^\d{9}$")
MAX_BODY_BYTES = 64 * 1024
DEFAULT_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173", "https://aztec-housing-2eafkx32d-andythai2004-9922s-projects.vercel.app", "https://aztec-housing-hub.vercel.app"}

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set.")

# Initialize thread-safe connection pool
db_pool = psycopg2.pool.ThreadedConnectionPool(1, 20, dsn=DATABASE_URL)

# ---------------------------------------------------------------------------
# Vulgarity filter (backed by better-profanity library)
# ---------------------------------------------------------------------------
profanity.load_censor_words()


def contains_vulgarity(text: str) -> bool:
    return profanity.contains_profanity(text)


def censor_text(text: str) -> str:
    return profanity.censor(text)


def clamp_price(value: int | float) -> int:
    return max(25, min(10000, int(value)))


# ---------------------------------------------------------------------------
# Database & Config helpers
# ---------------------------------------------------------------------------


@contextmanager
def get_db():
    conn = db_pool.getconn()
    try:
        yield conn
    finally:
        db_pool.putconn(conn)


def _load_config() -> object:
    """Load config.json from the data directory."""
    path = DATA_DIR / "config.json"
    if not path.exists():
        return None
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


# ---------------------------------------------------------------------------
# Auth helpers
# ---------------------------------------------------------------------------


def hash_password(password: str, salt=None) -> dict:
    salt_bytes = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 120000)
    return {
        "salt": base64.b64encode(salt_bytes).decode("utf-8"),
        "hash": base64.b64encode(digest).decode("utf-8"),
    }


def verify_password(password: str, stored: dict) -> bool:
    try:
        salt = base64.b64decode(stored["salt"])
    except (KeyError, ValueError, TypeError):
        return False
    computed = hash_password(password, salt)
    return hmac.compare_digest(computed["hash"], stored.get("hash", ""))


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------


class DataHandler(BaseHTTPRequestHandler):
    _GET_ROUTES = {
        "/api/health": "_handle_health",
        "/api/listings": "_handle_listings",
        "/api/zipcodes": "_handle_zipcodes",
        "/api/click-history": "_handle_click_history",
    }
    _POST_ROUTES = {
        "/api/signup": "_handle_signup",
        "/api/login": "_handle_login",
        "/api/track-click": "_handle_track_click",
        "/api/add-listing": "_handle_add_listing",
        "/api/profanity-check": "_handle_profanity_check",
    }
    _PUT_ROUTES = {
        "/api/update-name": "_handle_update_name",
        "/api/update-roommate": "_handle_update_roommate",
        "/api/update-listing": "_handle_update_listing",
    }
    _DELETE_ROUTES = {
        "/api/delete-listing": "_handle_delete_listing",
    }

    def __init__(self, *args, **kwargs):
        self._force_close_after_response = False
        super().__init__(*args, **kwargs)

    def force_close_connection(self):
        self._force_close_after_response = True

    def _get_allowed_origins(self):
        raw = os.environ.get("CORS_ALLOW_ORIGINS", "").strip()
        if not raw:
            return DEFAULT_ALLOWED_ORIGINS
        origins = {e.strip() for e in raw.split(",") if e.strip()}
        return origins or DEFAULT_ALLOWED_ORIGINS

    def _send_cors_headers(self):
        origin = self.headers.get("Origin")
        if not origin:
            return
        if origin in self._get_allowed_origins():
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def end_headers(self):
        self._send_cors_headers()
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header(
            "Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS, DELETE"
        )
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def _route(self):
        if self.command == "GET":
            routes = self._GET_ROUTES
        elif self.command == "PUT":
            routes = self._PUT_ROUTES
        elif self.command == "DELETE":
            routes = self._DELETE_ROUTES
        else:
            routes = self._POST_ROUTES
        return routes.get(self.path.split("?")[0])

    # -- GET handlers -------------------------------------------------------

    def _handle_health(self):
        try:
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT 1")
            self.respond(200, {"status": "ok", "db": "connected"})
        except Exception as e:
            self.respond(500, {"status": "error", "db": str(e)})

    def _handle_config(self):
        data = _load_config()
        if data is None:
            self.respond(500, {"message": "config not found"})
            return
        self.respond(200, data)

    def _handle_zipcodes(self):
        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT zip, city FROM zipcodes ORDER BY zip ASC")
                    rows = cur.fetchall()
            self.respond(200, {"zipcodes": [dict(r) for r in rows]})
        except Exception as e:
            self.respond(500, {"message": "Failed to fetch zipcodes."})

    def _handle_listings(self):
        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT l.*, u.bio as poster_bio,
                               COALESCE(ch_agg.history, '[]'::json) as click_history
                        FROM listings l
                        LEFT JOIN users u ON l.owner_email = u.email
                        LEFT JOIN (
                            SELECT listing_id, json_agg(json_build_object('date', date, 'count', count)) as history
                            FROM listing_click_history
                            GROUP BY listing_id
                        ) ch_agg ON l.id = ch_agg.listing_id
                    """)
                    rows = cur.fetchall()

            on_campus = []
            off_campus = []
            for row in rows:
                listing = {
                    "id": row["id"],
                    "title": row["title"],
                    "type": row["type"],
                    "placement": row["placement"],
                    "area": row["area"],
                    "beds": row["beds"],
                    "baths": row["baths"],
                    "price": row["price"],
                    "availability": row["availability"],
                    "description": row["description"],
                    "url": row["url"],
                    "clicks": row["clicks"],
                    "clickHistory": row["click_history"],
                }
                if row.get("distance") is not None:
                    listing["distance"] = row["distance"]
                if row.get("owner_email"):
                    listing["ownerEmail"] = row["owner_email"]
                if row.get("roommate_status"):
                    listing["roommateStatus"] = row["roommate_status"]
                if row.get("poster_bio"):
                    listing["posterBio"] = row["poster_bio"]

                if listing["placement"] == "onCampus":
                    on_campus.append(listing)
                else:
                    off_campus.append(listing)

            self.respond(200, {"onCampus": on_campus, "offCampus": off_campus})
        except Exception as e:
            self.respond(500, {"message": "Failed to load listings."})

    def _handle_click_history(self):
        query = self.query_string_parsed()
        listing_id = query.get("listingId")
        if not listing_id:
            self.respond(400, {"message": "listingId is required."})
            return

        try:
            listing_id = int(listing_id)
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        "SELECT date, count FROM listing_click_history WHERE listing_id = %s ORDER BY date ASC",
                        (listing_id,),
                    )
                    rows = cur.fetchall()

            history = [
                {
                    "date": (
                        r["date"].strftime("%Y-%m-%d")
                        if hasattr(r["date"], "strftime")
                        else str(r["date"])
                    ),
                    "count": r["count"],
                }
                for r in rows
            ]
            self.respond(200, {"history": history})
        except Exception as e:
            self.respond(500, {"message": "Failed to fetch click history."})

    # -- POST handlers ------------------------------------------------------

    def _handle_profanity_check(self):
        payload = self.read_json()
        if payload is None:
            return
        text = str(payload.get("text", ""))
        self.respond(
            200,
            {
                "isProfane": profanity.contains_profanity(text),
                "censored": profanity.censor(text),
            },
        )

    def _handle_signup(self):
        payload = self.read_json()
        if payload is None:
            return

        errors = {}
        first_name = str(payload.get("firstName", "")).strip()
        last_name = str(payload.get("lastName", "")).strip()
        red_id = str(payload.get("redId", "")).strip()
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))
        confirm_password = str(payload.get("confirmPassword", ""))

        if not first_name:
            errors["firstName"] = "First name is required."
        if not last_name:
            errors["lastName"] = "Last name is required."
        if contains_vulgarity(first_name) or contains_vulgarity(last_name):
            errors["name"] = "Name contains inappropriate language."

        if not red_id:
            errors["redId"] = "Red ID is required."
        elif not RED_ID_PATTERN.match(red_id):
            errors["redId"] = "Red ID must be exactly 9 digits."

        if not email or not email.endswith("@sdsu.edu"):
            errors["email"] = "SDSU email is required."

        if not password:
            errors["password"] = "Password is required."
        elif len(password) < 8:
            errors["password"] = "Password must be at least 8 characters."
        if not confirm_password:
            errors["confirmPassword"] = "Please confirm your password."
        elif password != confirm_password:
            errors["confirmPassword"] = "Passwords do not match."

        if not errors:
            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT 1 FROM users WHERE red_id = %s", (red_id,))
                        if cur.fetchone():
                            errors["redId"] = "That Red ID is already registered."
                        cur.execute("SELECT 1 FROM users WHERE email = %s", (email,))
                        if cur.fetchone():
                            errors["email"] = "That SDSU email is already registered."
            except Exception as e:
                self.respond(500, {"message": "Database validation failed."})
                return

        if errors:
            self.respond(
                400, {"message": "Please fix the highlighted fields.", "errors": errors}
            )
            return

        password_data = hash_password(password)
        first_name_clean = censor_text(first_name)
        last_name_clean = censor_text(last_name)

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        """
                        INSERT INTO users (first_name, last_name, red_id, email, password_hash, password_salt, bio)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        RETURNING id, first_name, last_name, red_id, email, bio
                    """,
                        (
                            first_name_clean,
                            last_name_clean,
                            red_id,
                            email,
                            password_data["hash"],
                            password_data["salt"],
                            "",
                        ),
                    )
                    new_user_row = cur.fetchone()
                conn.commit()

            self.respond(
                201,
                {
                    "message": "Account created successfully.",
                    "user": {
                        "firstName": new_user_row["first_name"],
                        "lastName": new_user_row["last_name"],
                        "redId": new_user_row["red_id"],
                        "email": new_user_row["email"],
                        "bio": new_user_row["bio"],
                    },
                },
            )
        except Exception as e:
            self.respond(500, {"message": "Failed to create account."})

    def _handle_login(self):
        payload = self.read_json()
        if payload is None:
            return

        errors = {}
        email = str(payload.get("email", "")).strip().lower()
        password = str(payload.get("password", ""))

        if not email:
            errors["email"] = "Email is required."
        if not password:
            errors["password"] = "Password is required."

        if errors:
            self.respond(
                400, {"message": "Please fix the highlighted fields.", "errors": errors}
            )
            return

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("SELECT * FROM users WHERE email = %s", (email,))
                    user_row = cur.fetchone()

            if not user_row:
                self.respond(
                    401,
                    {
                        "message": "Login failed.",
                        "errors": {"general": "Incorrect email or password."},
                    },
                )
                return

            stored_password = {
                "salt": user_row["password_salt"],
                "hash": user_row["password_hash"],
            }

            if not verify_password(password, stored_password):
                self.respond(
                    401,
                    {
                        "message": "Login failed.",
                        "errors": {"general": "Incorrect email or password."},
                    },
                )
                return

            self.respond(
                200,
                {
                    "message": "Login successful.",
                    "user": {
                        "firstName": user_row["first_name"],
                        "lastName": user_row["last_name"],
                        "redId": user_row["red_id"],
                        "email": user_row["email"],
                        "bio": user_row.get("bio", ""),
                    },
                },
            )
        except Exception as e:
            self.respond(500, {"message": "Login process failed."})

    def _handle_add_listing(self):
        payload = self.read_json()
        if payload is None:
            return

        title = str(payload.get("title", "")).strip()
        price = payload.get("price")
        area = str(payload.get("area", "")).strip()
        beds = payload.get("beds", 0)
        baths = payload.get("baths", 0)
        distance = payload.get("distance", 0)
        availability = str(payload.get("availability", "")).strip()
        description = str(payload.get("description", "")).strip()
        listing_type = str(payload.get("type", "Apartment")).strip()
        placement = str(payload.get("placement", "offCampus")).strip()
        owner_email = str(payload.get("ownerEmail", "")).strip().lower()
        roommate_status = str(payload.get("roommateStatus", "")).strip()

        errors = {}
        if not title:
            errors["title"] = "Title is required."
        elif contains_vulgarity(title):
            errors["title"] = "Title contains inappropriate language."

        if not area:
            errors["area"] = "Area is required."
        elif contains_vulgarity(area):
            errors["area"] = "Area contains inappropriate language."

        if description and contains_vulgarity(description):
            errors["description"] = "Description contains inappropriate language."

        if not price or int(price) < 1:
            errors["price"] = "Price must be at least $1."

        if not availability:
            errors["availability"] = "Availability is required."

        if not listing_type:
            errors["type"] = "Listing type is required."

        if not errors:
            try:
                with get_db() as conn:
                    with conn.cursor() as cur:
                        cur.execute(
                            "SELECT 1 FROM listings WHERE LOWER(title) = LOWER(%s)",
                            (title,),
                        )
                        if cur.fetchone():
                            errors["title"] = (
                                "A listing with this title already exists."
                            )
            except Exception as e:
                self.respond(500, {"message": "Validation failed."})
                return

        if errors:
            self.respond(
                400, {"message": "Please fix the highlighted fields.", "errors": errors}
            )
            return

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    new_id = random.randint(1000000000, 9999999999)
                    while True:
                        cur.execute("SELECT 1 FROM listings WHERE id = %s", (new_id,))
                        if not cur.fetchone():
                            break
                        new_id = random.randint(1000000000, 9999999999)

                    cur.execute(
                        """
                        INSERT INTO listings (
                            id, title, area, price, beds, baths, distance, availability,
                            description, type, placement, owner_email, roommate_status, clicks, url
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        RETURNING *
                    """,
                        (
                            new_id,
                            censor_text(title),
                            censor_text(area),
                            clamp_price(price),
                            int(beds),
                            int(baths),
                            float(distance),
                            availability,
                            censor_text(description),
                            listing_type,
                            placement,
                            owner_email,
                            roommate_status,
                            0,
                            "#",
                        ),
                    )
                    new_db_listing = cur.fetchone()
                conn.commit()

            new_listing = {
                "id": new_db_listing["id"],
                "title": new_db_listing["title"],
                "area": new_db_listing["area"],
                "price": new_db_listing["price"],
                "beds": new_db_listing["beds"],
                "baths": new_db_listing["baths"],
                "distance": new_db_listing["distance"],
                "availability": new_db_listing["availability"],
                "description": new_db_listing["description"],
                "type": new_db_listing["type"],
                "placement": new_db_listing["placement"],
                "ownerEmail": new_db_listing["owner_email"],
                "roommateStatus": new_db_listing["roommate_status"],
                "clicks": new_db_listing["clicks"],
                "url": new_db_listing["url"],
            }
            self.respond(
                201,
                {"message": "Listing created successfully.", "listing": new_listing},
            )
        except Exception as e:
            self.respond(500, {"message": "Failed to create listing."})

    def _handle_track_click(self):
        payload = self.read_json()
        if payload is None:
            return

        listing_id = payload.get("listingId")
        if listing_id is None:
            self.respond(400, {"message": "listingId is required."})
            return

        try:
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE listings SET clicks = clicks + 1 WHERE id = %s RETURNING id",
                        (listing_id,),
                    )
                    if not cur.fetchone():
                        self.respond(404, {"message": "Listing not found."})
                        return

                    pst_now = datetime.utcnow() - timedelta(hours=7)
                    today = pst_now.strftime("%Y-%m-%d")

                    cur.execute(
                        """
                        INSERT INTO listing_click_history (listing_id, date, count)
                        VALUES (%s, %s, 1)
                        ON CONFLICT (listing_id, date)
                        DO UPDATE SET count = listing_click_history.count + 1
                    """,
                        (listing_id, today),
                    )

                    ninety_days_ago = pst_now - timedelta(days=90)
                    cur.execute(
                        "DELETE FROM listing_click_history WHERE listing_id = %s AND date < %s",
                        (listing_id, ninety_days_ago.strftime("%Y-%m-%d")),
                    )
                conn.commit()
            self.respond(200, {"message": "Click tracked."})
        except Exception as e:
            self.respond(500, {"message": "Failed to track click."})

    # -- PUT / DELETE handlers ----------------------------------------------

    def _handle_update_name(self):
        payload = self.read_json()
        if payload is None:
            return

        new_first = str(payload.get("firstName", "")).strip()
        new_last = str(payload.get("lastName", "")).strip()
        email = str(payload.get("email", "")).strip().lower()

        if not new_first or not new_last:
            self.respond(400, {"message": "First name and last name are required."})
            return
        if contains_vulgarity(new_first) or contains_vulgarity(new_last):
            self.respond(400, {"message": "Name contains inappropriate language."})
            return

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        """
                        UPDATE users
                        SET first_name = %s, last_name = %s
                        WHERE email = %s
                        RETURNING first_name, last_name, red_id, email, bio
                    """,
                        (censor_text(new_first), censor_text(new_last), email),
                    )
                    updated_user = cur.fetchone()

                if not updated_user:
                    self.respond(404, {"message": "User not found."})
                    return
                conn.commit()

            self.respond(
                200,
                {
                    "message": "Name updated successfully.",
                    "user": {
                        "firstName": updated_user["first_name"],
                        "lastName": updated_user["last_name"],
                        "redId": updated_user["red_id"],
                        "email": updated_user["email"],
                        "bio": updated_user.get("bio", ""),
                    },
                },
            )
        except Exception as e:
            self.respond(500, {"message": "Failed to update name."})

    def _handle_update_roommate(self):
        payload = self.read_json()
        if payload is None:
            return

        email = str(payload.get("email", "")).strip().lower()
        if not email:
            self.respond(400, {"message": "Email is required."})
            return

        updated = False
        updates = []
        params = []

        if "bio" in payload:
            val = str(payload.get("bio", "")).strip()
            if contains_vulgarity(val):
                self.respond(400, {"message": "Bio contains inappropriate language."})
                return
            updates.append("bio = %s")
            params.append(censor_text(val) if val else "")
            updated = True

        if "cleanliness" in payload:
            updates.append("cleanliness = %s")
            params.append(str(payload.get("cleanliness", "")).strip())
            updated = True

        if "sleepSchedule" in payload:
            updates.append("sleep_schedule = %s")
            params.append(str(payload.get("sleepSchedule", "")).strip())
            updated = True

        if "roommateStatus" in payload:
            updates.append("roommate_status = %s")
            params.append(str(payload.get("roommateStatus", "")).strip())
            updated = True

        if not updated:
            self.respond(400, {"message": "No roommate fields to update."})
            return

        params.append(email)

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        f"""
                        UPDATE users
                        SET {", ".join(updates)}
                        WHERE email = %s
                        RETURNING first_name, last_name, red_id, email, bio
                    """,
                        tuple(params),
                    )
                    updated_user = cur.fetchone()

                if not updated_user:
                    self.respond(404, {"message": "User not found."})
                    return
                conn.commit()

            self.respond(
                200,
                {
                    "message": "Roommate profile saved.",
                    "user": {
                        "firstName": updated_user["first_name"],
                        "lastName": updated_user["last_name"],
                        "redId": updated_user["red_id"],
                        "email": updated_user["email"],
                        "bio": updated_user.get("bio", ""),
                    },
                },
            )
        except Exception as e:
            self.respond(500, {"message": "Failed to update roommate profile."})

    def _handle_update_listing(self):
        payload = self.read_json()
        if payload is None:
            return

        listing_id = payload.get("id")
        if not listing_id:
            self.respond(400, {"message": "listing id is required."})
            return

        try:
            listing_id = int(listing_id)
        except (ValueError, TypeError):
            self.respond(400, {"message": "Invalid listing id."})
            return

        updates = []
        params = []

        if "price" in payload:
            updates.append("price = %s")
            params.append(clamp_price(payload["price"]))
        if "description" in payload:
            desc = str(payload["description"]).strip()
            if contains_vulgarity(desc):
                self.respond(
                    400, {"message": "Description contains inappropriate language."}
                )
                return
            updates.append("description = %s")
            params.append(censor_text(desc))
        if "title" in payload:
            title = str(payload["title"]).strip()
            if contains_vulgarity(title):
                self.respond(400, {"message": "Title contains inappropriate language."})
                return
            updates.append("title = %s")
            params.append(censor_text(title))
        if "roommateStatus" in payload:
            updates.append("roommate_status = %s")
            params.append(str(payload["roommateStatus"]).strip())
        if "availability" in payload:
            updates.append("availability = %s")
            params.append(str(payload["availability"]).strip())

        if not updates:
            self.respond(400, {"message": "No fields to update."})
            return

        params.append(listing_id)

        try:
            with get_db() as conn:
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute(
                        f"""
                        UPDATE listings
                        SET {", ".join(updates)}
                        WHERE id = %s
                        RETURNING *
                    """,
                        tuple(params),
                    )
                    updated_db_listing = cur.fetchone()

                if not updated_db_listing:
                    self.respond(404, {"message": "Listing not found."})
                    return
                conn.commit()

            listing_to_update = {
                "id": updated_db_listing["id"],
                "title": updated_db_listing["title"],
                "type": updated_db_listing["type"],
                "placement": updated_db_listing["placement"],
                "area": updated_db_listing["area"],
                "beds": updated_db_listing["beds"],
                "baths": updated_db_listing["baths"],
                "price": updated_db_listing["price"],
                "availability": updated_db_listing["availability"],
                "description": updated_db_listing["description"],
                "url": updated_db_listing["url"],
                "clicks": updated_db_listing["clicks"],
            }
            if updated_db_listing.get("distance") is not None:
                listing_to_update["distance"] = updated_db_listing["distance"]
            if updated_db_listing.get("owner_email"):
                listing_to_update["ownerEmail"] = updated_db_listing["owner_email"]
            if updated_db_listing.get("roommate_status"):
                listing_to_update["roommateStatus"] = updated_db_listing[
                    "roommate_status"
                ]

            self.respond(
                200,
                {
                    "message": "Listing updated successfully.",
                    "listing": listing_to_update,
                },
            )
        except Exception as e:
            self.respond(500, {"message": "Failed to update listing."})

    def _handle_delete_listing(self):
        payload = self.read_json()
        if payload is None:
            return

        listing_id = payload.get("listingId")
        if not listing_id:
            self.respond(400, {"message": "listingId is required."})
            return

        try:
            listing_id = int(listing_id)
        except (ValueError, TypeError):
            self.respond(400, {"message": "Invalid listingId."})
            return

        try:
            with get_db() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "DELETE FROM listings WHERE id = %s RETURNING id", (listing_id,)
                    )
                    if not cur.fetchone():
                        self.respond(404, {"message": "Listing not found."})
                        return
                conn.commit()
            self.respond(200, {"message": "Listing deleted successfully."})
        except Exception as e:
            self.respond(500, {"message": "Failed to delete listing."})

    # -- HTTP verbs ---------------------------------------------------------

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        handler = self._route()
        if handler:
            getattr(self, handler)()
        else:
            self.respond(404, {"message": "Not found."})

    def do_POST(self):
        handler = self._route()
        if handler:
            getattr(self, handler)()
        else:
            self.respond(404, {"message": "Not found."})

    def do_PUT(self):
        handler = self._route()
        if handler:
            getattr(self, handler)()
        else:
            self.respond(404, {"message": "Not found."})

    def do_DELETE(self):
        handler = self._route()
        if handler:
            getattr(self, handler)()
        else:
            self.respond(404, {"message": "Not found."})

    # -- Raw request helpers ------------------------------------------------

    def read_json(self):
        try:
            content_length = int(self.headers.get("Content-Length", "0"))
        except ValueError:
            self.force_close_connection()
            self.respond(400, {"message": "Invalid Content-Length header."})
            return None
        if content_length < 0:
            self.force_close_connection()
            self.respond(400, {"message": "Invalid Content-Length header."})
            return None
        if content_length > MAX_BODY_BYTES:
            self.force_close_connection()
            self.respond(413, {"message": "Request body too large."})
            return None
        raw = self.rfile.read(content_length) if content_length else b"{}"
        try:
            return json.loads(raw.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.respond(400, {"message": "Request body must be valid JSON."})
            return None

    def respond(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if self._force_close_after_response or self.close_connection:
            self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def query_string_parsed(self):
        parsed = urlparse(self.path)
        return dict(parse_qs(parsed.query))

    def log_message(self, format, *args):
        return  # silence


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------


def run():
    server = ThreadingHTTPServer((HOST, PORT), DataHandler)
    print(f"Data server running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
