"""JSON data API for the Aztec Housing Hub prototype.

Serves housing listings, roommate profiles, and UI config from static JSON
files so the frontend has zero hardcoded data.
"""

import base64
import hashlib
import hmac
import json
import os
import re
import random
import threading
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse, parse_qs

from better_profanity import profanity

HOST = "127.0.0.1"
PORT = 5000
DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = Path(__file__).with_name("users.json")
RED_ID_PATTERN = re.compile(r"^\d{9}$")
MAX_BODY_BYTES = 64 * 1024
USERS_LOCK = threading.RLock()
DATA_LOCK = threading.RLock()
DEFAULT_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}

# ---------------------------------------------------------------------------
# Vulgarity filter (backed by better-profanity library)
# ---------------------------------------------------------------------------
# Load the default profanity word list from better-profanity at startup.
profanity.load_censor_words()


def contains_vulgarity(text: str) -> bool:
    """Return True if the text contains any vulgar word (case-insensitive)."""
    return profanity.contains_profanity(text)


def censor_text(text: str) -> str:
    """Censor vulgar words in text, returning a sanitized string."""
    return profanity.censor(text)


def clamp_price(value: int | float) -> int:
    """Clamp price between 25 and 10000."""
    return max(25, min(10000, int(value)))


# ---------------------------------------------------------------------------
# Static-data helpers
# ---------------------------------------------------------------------------


def _load_json(name: str) -> object:
    """Load a JSON file from the data directory (thread-safe)."""
    path = DATA_DIR / name
    with DATA_LOCK:
        if not path.exists():
            return None
        try:
            with path.open("r", encoding="utf-8") as f:
                return json.load(f)
        except (json.JSONDecodeError, UnicodeDecodeError):
            return None


def _save_json(name: str, data: object) -> None:
    """Persist a JSON file atomically."""
    path = DATA_DIR / name
    tmp = path.with_suffix(path.suffix + ".tmp")
    with DATA_LOCK:
        with tmp.open("w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            f.flush()
            os.fsync(f.fileno())
        os.replace(tmp, path)


def _save_listings(data: dict) -> None:
    """Persist listings data to disk atomically."""
    _save_json("listings.json", data)


# ---------------------------------------------------------------------------
# User helpers
# ---------------------------------------------------------------------------


def load_users() -> list:
    """Load the user list from disk.  Returns [] when missing or invalid."""
    with USERS_LOCK:
        if not DATA_FILE.exists():
            return []
        with DATA_FILE.open("r", encoding="utf-8") as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                return []
        return data if isinstance(data, list) else []


def save_users(users: list) -> None:
    """Persist the user list to disk atomically."""
    with USERS_LOCK:
        tmp = DATA_FILE.with_suffix(DATA_FILE.suffix + ".tmp")
        with tmp.open("w", encoding="utf-8") as file:
            json.dump(users, file, indent=2)
            file.flush()
            os.fsync(file.fileno())
        os.replace(tmp, DATA_FILE)


def hash_password(password: str, salt=None) -> dict:
    """Hash a password with PBKDF2-HMAC-SHA256."""
    salt_bytes = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 120000)
    return {
        "salt": base64.b64encode(salt_bytes).decode("utf-8"),
        "hash": base64.b64encode(digest).decode("utf-8"),
    }


def verify_password(password: str, stored: dict) -> bool:
    """Verify a password against stored hash data."""
    try:
        salt = base64.b64decode(stored["salt"])
    except (KeyError, ValueError, TypeError):
        return False
    computed = hash_password(password, salt)
    return hmac.compare_digest(computed["hash"], stored.get("hash", ""))


def validate_signup(payload: dict, users: list) -> tuple:
    """Validate and normalize the signup request payload."""
    errors = {}
    first_name = str(payload.get("firstName", "")).strip()
    last_name = str(payload.get("lastName", "")).strip()
    red_id = str(payload.get("redId", "")).strip()
    email = str(payload.get("email", "")).strip()
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
    elif any(user.get("redId") == red_id for user in users):
        errors["redId"] = "That Red ID is already registered."
    if not email or not email.endswith("@sdsu.edu"):
        errors["email"] = "SDSU email is required."
    elif not email:
        errors["email"] = "Use a valid SDSU email address."
    elif any(user.get("email") == email for user in users):
        errors["email"] = "That SDSU email is already registered."
    if not password:
        errors["password"] = "Password is required."
    elif len(password) < 8:
        errors["password"] = "Password must be at least 8 characters."
    if not confirm_password:
        errors["confirmPassword"] = "Please confirm your password."
    elif password != confirm_password:
        errors["confirmPassword"] = "Passwords do not match."

    return errors, {
        "firstName": first_name,
        "lastName": last_name,
        "redId": red_id,
        "email": email,
        "password": password,
        "cleanliness": "Moderately clean",
        "sleepSchedule": "Night owl",
        "bio": "",
        "hobbies": "",
    }


def validate_login(payload: dict) -> tuple:
    """Validate and normalize the login request payload."""
    errors = {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    if not email:
        errors["email"] = "Email is required."
    if not password:
        errors["password"] = "Password is required."
    return errors, email, password


def _user_to_dict(user: dict) -> dict:
    """Convert a stored user record to the public-facing user dict."""
    return {
        "firstName": user.get("firstName", ""),
        "lastName": user.get("lastName", ""),
        "redId": user.get("redId", ""),
        "email": user.get("email", ""),
        "cleanliness": user.get("cleanliness", ""),
        "sleepSchedule": user.get("sleepSchedule", ""),
        "bio": user.get("bio", ""),
        "hobbies": user.get("hobbies", ""),
    }


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------


class DataHandler(BaseHTTPRequestHandler):
    """HTTP handler for auth + static-data endpoints."""

    # Route table: method -> {path: handler}
    _GET_ROUTES = {
        "/api/health": "_handle_health",
        "/api/listings": "_handle_listings",
        "/api/config": "_handle_config",
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
    }

    _DELETE_ROUTES = {
        "/api/delete-listing": "_handle_delete_listing",
    }

    def __init__(self, *args, **kwargs):
        self._force_close_after_response = False
        super().__init__(*args, **kwargs)

    def force_close_connection(self):
        self._force_close_after_response = True

    # -- CORS & headers ----------------------------------------------------

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
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, OPTIONS")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    # -- Routing helpers ---------------------------------------------------

    def _route(self):
        """Return the handler method name or None."""
        if self.command == "GET":
            routes = self._GET_ROUTES
        elif self.command == "PUT":
            routes = self._PUT_ROUTES
        else:
            routes = self._POST_ROUTES
        return routes.get(self.path)

    # -- GET handlers -------------------------------------------------------

    def _handle_health(self):
        self.respond(200, {"status": "ok"})

    def _handle_listings(self):
        data = _load_json("listings.json")
        if data is None:
            self.respond(500, {"message": "listings data not found"})
            return

        # Enrich each listing with poster's roommate profile
        users = load_users()
        email_to_user = {u.get("email", ""): u for u in users}

        for section in ("onCampus", "offCampus"):
            for listing in data.get(section, []):
                owner_email = listing.get("ownerEmail", "")
                poster = email_to_user.get(owner_email)
                if poster:
                    listing["posterRoommateStatus"] = poster.get("roommateStatus", "")
                    listing["posterBio"] = poster.get("bio", "")
                    listing["posterHobbies"] = poster.get("hobbies", "")
                    listing["posterCleanliness"] = poster.get("cleanliness", "")
                    listing["posterSleepSchedule"] = poster.get("sleepSchedule", "")

        self.respond(200, data)

    def _handle_config(self):
        data = _load_json("config.json")
        if data is None:
            self.respond(500, {"message": "config not found"})
            return
        self.respond(200, data)

    def _handle_zipcodes(self):
        data = _load_json("zipcodes.json")
        if data is None:
            self.respond(500, {"message": "zipcodes data not found"})
            return
        self.respond(200, {"zipcodes": data})

    # -- POST handlers ------------------------------------------------------

    def _handle_profanity_check(self):
        """Check a text string for profanity.  Expects {"text": "...."}."""
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
        with USERS_LOCK:
            users = load_users()
            errors, cleaned = validate_signup(payload, users)
            if errors:
                self.respond(
                    400,
                    {"message": "Please fix the highlighted fields.", "errors": errors},
                )
                return
            password_data = hash_password(cleaned["password"])
            new_user = {
                "firstName": censor_text(cleaned["firstName"]),
                "lastName": censor_text(cleaned["lastName"]),
                "redId": cleaned["redId"],
                "email": cleaned["email"],
                "password": password_data,
                "cleanliness": cleaned.get("cleanliness", "Moderately clean"),
                "sleepSchedule": cleaned.get("sleepSchedule", "Night owl"),
                "bio": cleaned.get("bio", ""),
                "hobbies": cleaned.get("hobbies", ""),
                "roommateStatus": cleaned.get("roommateStatus", ""),
            }
            users.append(new_user)
            save_users(users)
        self.respond(
            201,
            {
                "message": "Account created successfully.",
                "user": _user_to_dict(new_user),
            },
        )

    def _handle_login(self):
        payload = self.read_json()
        if payload is None:
            return
        errors, email, password = validate_login(payload)
        if errors:
            self.respond(
                400,
                {"message": "Please fix the highlighted fields.", "errors": errors},
            )
            return
        users = load_users()
        user = next((u for u in users if u.get("email") == email), None)
        if not user or not verify_password(password, user.get("password", {})):
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
                "user": _user_to_dict(user),
            },
        )

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
        users = load_users()
        user = next((u for u in users if u.get("email") == email), None)
        if not user:
            self.respond(404, {"message": "User not found."})
            return
        user["firstName"] = censor_text(new_first)
        user["lastName"] = censor_text(new_last)
        save_users(users)
        self.respond(
            200,
            {
                "message": "Name updated successfully.",
                "user": _user_to_dict(user),
            },
        )

    def _handle_update_roommate(self):
        """Update the logged-in user's roommate profile fields."""
        payload = self.read_json()
        if payload is None:
            return
        email = str(payload.get("email", "")).strip().lower()
        if not email:
            self.respond(400, {"message": "Email is required."})
            return

        users = load_users()
        user = next((u for u in users if u.get("email") == email), None)
        if not user:
            self.respond(404, {"message": "User not found."})
            return

        # Update roommate-profile fields if present
        roommate_fields = ["cleanliness", "sleepSchedule", "bio", "hobbies", "roommateStatus"]
        updated = False
        for field in roommate_fields:
            if field in payload:
                value = str(payload.get(field, "")).strip()
                # Censor user-generated text fields
                if field in ("bio", "hobbies") and value:
                    value = censor_text(value)
                user[field] = value
                updated = True

        if not updated:
            self.respond(400, {"message": "No roommate fields to update."})
            return

        save_users(users)
        self.respond(
            200,
            {
                "message": "Roommate profile saved.",
                "user": _user_to_dict(user),
            },
        )

    def _handle_add_listing(self):
        """Persist a new off-campus listing submitted by a logged-in user."""
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
        owner_email = str(payload.get("ownerEmail", "")).strip()
        roommate_status = str(payload.get("roommateStatus", "")).strip()

        errors = {}
        if not title:
            errors["title"] = "Title is required."
        elif contains_vulgarity(title):
            errors["title"] = "Title contains inappropriate language."
        else:
            existing = _load_json("listings.json") or {"onCampus": [], "offCampus": []}
            all_titles = [
                l.get("title", "").lower()
                for l in existing.get("onCampus", []) + existing.get("offCampus", [])
            ]
            if title.lower() in all_titles:
                errors["title"] = "A listing with this title already exists."
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

        if errors:
            self.respond(
                400,
                {"message": "Please fix the highlighted fields.", "errors": errors},
            )
            return

        data = _load_json("listings.json")
        if data is None:
            data = {"onCampus": [], "offCampus": []}

        new_id = random.randint(1000000000, 9999999999)
        while any(
            existing.get("id") == new_id
            for existing in data.get("onCampus", []) + data.get("offCampus", [])
        ):
            new_id = random.randint(1000000000, 9999999999)

        new_listing = {
            "id": new_id,
            "title": censor_text(title),
            "area": censor_text(area),
            "price": clamp_price(price),
            "beds": int(beds),
            "baths": int(baths),
            "distance": float(distance),
            "availability": availability,
            "description": censor_text(description),
            "type": listing_type,
            "placement": placement,
            "ownerEmail": owner_email,
            "roommateStatus": roommate_status,
            "clicks": 0,
            "url": "#",
        }

        section = "onCampus" if placement == "onCampus" else "offCampus"
        data[section].append(new_listing)
        _save_listings(data)

        self.respond(
            201, {"message": "Listing created successfully.", "listing": new_listing}
        )

    def _handle_track_click(self):
        payload = self.read_json()
        if payload is None:
            return
        listing_id = payload.get("listingId")
        if listing_id is None:
            self.respond(400, {"message": "listingId is required."})
            return
        data = _load_json("listings.json")
        if data is None:
            self.respond(500, {"message": "listings data not found"})
            return
        found = False
        for section in ("onCampus", "offCampus"):
            for listing in data.get(section, []):
                if listing.get("id") == listing_id:
                    listing["clicks"] = (listing.get("clicks") or 0) + 1
                    # Record per-day click history
                    today = datetime.utcnow().strftime("%Y-%m-%d")
                    click_history = listing.get("clickHistory", [])
                    if click_history and click_history[-1].get("date") == today:
                        click_history[-1]["count"] += 1
                    else:
                        click_history.append({"date": today, "count": 1})
                    listing["clickHistory"] = click_history
                    # Trim to last 90 days
                    if len(click_history) > 90:
                        click_history[:] = click_history[-90:]
                    found = True
                    break
            if found:
                break
        if not found:
            self.respond(404, {"message": "Listing not found."})
            return
        _save_listings(data)
        self.respond(200, {"message": "Click tracked."})

    def _handle_click_history(self):
        query = self.query_string_parsed()
        listing_id = query.get("listingId")
        if listing_id is None:
            self.respond(400, {"message": "listingId is required."})
            return
        try:
            listing_id = int(listing_id)
        except (ValueError, TypeError):
            self.respond(400, {"message": "Invalid listingId."})
            return
        data = _load_json("listings.json")
        if data is None:
            self.respond(500, {"message": "listings data not found"})
            return
        found = False
        history = []
        for section in ("onCampus", "offCampus"):
            for listing in data.get(section, []):
                if listing.get("id") == listing_id:
                    found = True
                    history = listing.get("clickHistory", [])
                    break
            if found:
                break
        if not found:
            self.respond(404, {"message": "Listing not found."})
            return
        self.respond(200, {"history": history})

    def _handle_delete_listing(self):
        payload = self.read_json()
        if payload is None:
            return
        listing_id = payload.get("listingId")
        if listing_id is None:
            self.respond(400, {"message": "listingId is required."})
            return
        try:
            listing_id = int(listing_id)
        except (ValueError, TypeError):
            self.respond(400, {"message": "Invalid listingId."})
            return
        data = _load_json("listings.json")
        if data is None:
            self.respond(500, {"message": "listings data not found"})
            return
        found = False
        for section in ("onCampus", "offCampus"):
            original_len = len(data.get(section, []))
            data[section] = [l for l in data.get(section, []) if l.get("id") != listing_id]
            if len(data[section]) < original_len:
                found = True
                break
        if not found:
            self.respond(404, {"message": "Listing not found."})
            return
        _save_listings(data)
        self.respond(200, {"message": "Listing deleted successfully."})

    # -- PUT handler --------------------------------------------------------

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
        """Parse query string parameters into a dict."""
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