"""Minimal JSON auth API for a prototype frontend.

This module intentionally uses Python's built-in `http.server` to provide a tiny
HTTP API for signup/login during local development. User records are stored in a
local JSON file next to this module.
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
DATA_FILE = Path(__file__).with_name("users.json")
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*sdsu\.edu$")
RED_ID_PATTERN = re.compile(r"^\d{9}$")
MAX_BODY_BYTES = 64 * 1024
USERS_LOCK = threading.RLock()
DEFAULT_ALLOWED_ORIGINS = {"http://localhost:5173", "http://127.0.0.1:5173"}


def load_users():
    """Load the user list from disk.

    Returns an empty list when the file is missing or invalid.
    """
    with USERS_LOCK:
        if not DATA_FILE.exists():
            return []

        with DATA_FILE.open("r", encoding="utf-8") as file:
            try:
                data = json.load(file)
            except json.JSONDecodeError:
                return []

        return data if isinstance(data, list) else []


def save_users(users):
    """Persist the user list to disk atomically."""
    with USERS_LOCK:
        tmp_path = DATA_FILE.with_suffix(DATA_FILE.suffix + ".tmp")
        with tmp_path.open("w", encoding="utf-8") as file:
            json.dump(users, file, indent=2)
            file.flush()
            os.fsync(file.fileno())
        os.replace(tmp_path, DATA_FILE)


def hash_password(password, salt=None):
    """Hash a password with PBKDF2-HMAC-SHA256.

    Args:
        password: Plaintext password.
        salt: Optional raw bytes salt. When omitted, generates a new random salt.

    Returns:
        Dict with base64-encoded `salt` and `hash` values.
    """
    salt_bytes = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 120000)
    return {
        "salt": base64.b64encode(salt_bytes).decode("utf-8"),
        "hash": base64.b64encode(digest).decode("utf-8"),
    }


def verify_password(password, stored):
    """Verify a password against stored hash data."""
    try:
        salt = base64.b64decode(stored["salt"])
    except (KeyError, ValueError, TypeError):
        return False

    computed = hash_password(password, salt)
    return hmac.compare_digest(computed["hash"], stored.get("hash", ""))


def validate_signup(payload, users):
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
        errors["redId"] = "Red ID must be exactly 9 digits."
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


def validate_login(payload):
    """Validate and normalize the login request payload."""
    errors = {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email:
        errors["email"] = "Email is required."

    if not password:
        errors["password"] = "Password is required."

    return errors, email, password


class AuthHandler(BaseHTTPRequestHandler):
    """HTTP handler implementing the auth endpoints for the prototype app."""

    def __init__(self, *args, **kwargs):
        self._force_close_after_response = False
        super().__init__(*args, **kwargs)

    def force_close_connection(self):
        """Force the server to close the underlying TCP connection after responding."""
        self._force_close_after_response = True

    def _get_allowed_origins(self):
        """Return the set of allowed CORS origins."""
        raw = os.environ.get("CORS_ALLOW_ORIGINS", "").strip()
        if not raw:
            return DEFAULT_ALLOWED_ORIGINS

        origins = set()
        for entry in raw.split(","):
            value = entry.strip()
            if value:
                origins.add(value)
        return origins or DEFAULT_ALLOWED_ORIGINS

    def _send_cors_headers(self):
        """Emit CORS response headers when the request Origin is allowed."""
        origin = self.headers.get("Origin")
        if not origin:
            return

        if origin in self._get_allowed_origins():
            self.send_header("Access-Control-Allow-Origin", origin)
            self.send_header("Vary", "Origin")

    def end_headers(self):
        """Finalize headers for all responses (CORS + security headers)."""
        self._send_cors_headers()
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "no-referrer")
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        """Handle health check requests."""
        if self.path != "/api/health":
            self.respond(404, {"message": "Not found."})
            return

        self.respond(200, {"status": "ok"})

    def do_POST(self):
        """Handle signup/login requests."""
        if self.path not in {"/api/signup", "/api/login"}:
            self.respond(404, {"message": "Not found."})
            return

        payload = self.read_json()
        if payload is None:
            return

        if self.path == "/api/signup":
            with USERS_LOCK:
                users = load_users()
                errors, cleaned = validate_signup(payload, users)
                if errors:
                    self.respond(
                        400,
                        {
                            "message": "Please fix the highlighted fields.",
                            "errors": errors,
                        },
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
            return

        errors, email, password = validate_login(payload)
        if errors:
            self.respond(
                400, {"message": "Please fix the highlighted fields.", "errors": errors}
            )
            return

        users = load_users()
        user = next((entry for entry in users if entry.get("email") == email), None)
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

    def read_json(self):
        """Read and decode a JSON request body with basic size validation."""
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
            # Avoid leaving unread bytes on a keep-alive connection.
            self.force_close_connection()
            self.respond(413, {"message": "Request body too large."})
            return None

        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            return json.loads(raw_body.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            self.respond(400, {"message": "Request body must be valid JSON."})
            return None

    def respond(self, status, payload):
        """Send a JSON response with the given status code and payload."""
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        if self._force_close_after_response or self.close_connection:
            self.send_header("Connection", "close")
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        """Suppress default console logging."""
        return


def run():
    """Run the local threaded HTTP server."""
    server = ThreadingHTTPServer((HOST, PORT), AuthHandler)
    print(f"Auth server running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
