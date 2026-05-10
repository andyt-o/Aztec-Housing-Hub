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
import threading
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"
PORT = 5000
DATA_DIR = Path(__file__).parent / "data"
DATA_FILE = Path(__file__).with_name("users.json")
# [A-Za-z0-9._%+-]@(([A-Za-z0-9-]+\\.)*sdsu\\.edu) — matches sub.sdsu.edu too
EMAIL_PATTERN = re.compile(
    r"^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*sdsu\.edu$"
)
RED_ID_PATTERN = re.compile(r"^\d{1,9}$")
MAX_BODY_BYTES = 64 * 1024
USERS_LOCK = threading.RLock()
DATA_LOCK = threading.RLock()
DEFAULT_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}

# ---------------------------------------------------------------------------
# Vulgarity filter
# ---------------------------------------------------------------------------
VULGAR_WORDS = {
    "fuck",
    "shit",
    "asshole",
    "bitch",
    "bastard",
    "cunt",
    "dick",
    "cock",
    "pussy",
    "twat",
    "nigger",
    "faggot",
    "nigga",
    "slut",
    "whore",
    "crap",
    "damn",
    "hell",
    "ass",
    "dumbass",
    "motherfucker",
    "fucker",
    "penis",
    "vagina",
    "tits",
    "boobs",
    "piss",
    "cum",
    "semen",
    "dildo",
    "fag",
    "retard",
    "moron",
    "idiot",
    "stupid",
    "ugly",
    "hoe",
    "trash",
    "garbage",
    "bullshit",
    "horseshit",
    "shithead",
    "shitface",
    "asswipe",
    "jerkoff",
    "wanker",
    "bollocks",
    "arse",
    "bloody",
    "sod",
    "bugger",
}


def contains_vulgarity(text: str) -> bool:
    """Return True if the text contains any vulgar word (case-insensitive)."""
    words = re.findall(r"[a-z0-9]+", text.lower())
    return any(w in VULGAR_WORDS for w in words)


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
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))
    confirm_password = str(payload.get("confirmPassword", ""))

    if not first_name:
        errors["firstName"] = "First name is required."
    if not last_name:
        errors["lastName"] = "Last name is required."
    if not red_id:
        errors["redId"] = "Red ID is required."
    elif not RED_ID_PATTERN.match(red_id):
        errors["redId"] = "Red ID must be 1-9 digits."
    elif any(user.get("redId") == red_id for user in users):
        errors["redId"] = "That Red ID is already registered."
    if not email:
        errors["email"] = "SDSU email is required."
    elif not EMAIL_PATTERN.match(email):
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


# ---------------------------------------------------------------------------
# HTTP handler
# ---------------------------------------------------------------------------


class DataHandler(BaseHTTPRequestHandler):
    """HTTP handler for auth + static-data endpoints."""

    # Route table: method -> {path: handler}
    _GET_ROUTES = {
        "/api/health": "_handle_health",
        "/api/listings": "_handle_listings",
        "/api/roommates": "_handle_roommates",
        "/api/config": "_handle_config",
    }
    _POST_ROUTES = {
        "/api/signup": "_handle_signup",
        "/api/login": "_handle_login",
    }
    _PUT_ROUTES = {
        "/api/update-name": "_handle_update_name",
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
        self.respond(200, data)

    def _handle_roommates(self):
        data = _load_json("roommates.json")
        if data is None:
            self.respond(500, {"message": "roommates data not found"})
            return
        self.respond(200, data)

    def _handle_config(self):
        data = _load_json("config.json")
        if data is None:
            self.respond(500, {"message": "config not found"})
            return
        self.respond(200, data)

    # -- POST handlers ------------------------------------------------------

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
            users.append(
                {
                    "firstName": cleaned["firstName"],
                    "lastName": cleaned["lastName"],
                    "redId": cleaned["redId"],
                    "email": cleaned["email"],
                    "password": password_data,
                }
            )
            save_users(users)
        self.respond(
            201,
            {
                "message": "Account created successfully.",
                "user": {
                    "firstName": cleaned["firstName"],
                    "lastName": cleaned["lastName"],
                    "redId": cleaned["redId"],
                    "email": cleaned["email"],
                },
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
                "user": {
                    "firstName": user["firstName"],
                    "lastName": user["lastName"],
                    "redId": user["redId"],
                    "email": user["email"],
                },
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
            self.respond(
                400, {"message": "First name and last name are required."}
            )
            return
        if contains_vulgarity(new_first) or contains_vulgarity(new_last):
            self.respond(
                400, {"message": "Name contains inappropriate language."}
            )
            return
        users = load_users()
        user = next((u for u in users if u.get("email") == email), None)
        if not user:
            self.respond(404, {"message": "User not found."})
            return
        user["firstName"] = new_first
        user["lastName"] = new_last
        save_users(users)
        self.respond(
            200,
            {
                "message": "Name updated successfully.",
                "user": {
                    "firstName": new_first,
                    "lastName": new_last,
                    "redId": user["redId"],
                    "email": user["email"],
                },
            },
        )

    # -- PUT handler (placeholder for future endpoints) ---- 

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