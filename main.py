import base64
import hashlib
import json
import os
import re
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


HOST = "127.0.0.1"
PORT = 5000
DATA_FILE = Path(__file__).with_name("users.json")
EMAIL_PATTERN = re.compile(r"^[A-Za-z0-9._%+-]+@(?:[A-Za-z0-9-]+\.)*sdsu\.edu$")
RED_ID_PATTERN = re.compile(r"^\d{9}$")


def load_users():
    if not DATA_FILE.exists():
        return []

    with DATA_FILE.open("r", encoding="utf-8") as file:
        try:
            data = json.load(file)
        except json.JSONDecodeError:
            return []

    return data if isinstance(data, list) else []


def save_users(users):
    with DATA_FILE.open("w", encoding="utf-8") as file:
        json.dump(users, file, indent=2)


def hash_password(password, salt=None):
    salt_bytes = salt or os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt_bytes, 120000)
    return {
        "salt": base64.b64encode(salt_bytes).decode("utf-8"),
        "hash": base64.b64encode(digest).decode("utf-8"),
    }


def verify_password(password, stored):
    try:
        salt = base64.b64decode(stored["salt"])
    except (KeyError, ValueError, TypeError):
        return False

    computed = hash_password(password, salt)
    return computed["hash"] == stored.get("hash")


def validate_signup(payload, users):
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
    errors = {}
    email = str(payload.get("email", "")).strip().lower()
    password = str(payload.get("password", ""))

    if not email:
        errors["email"] = "Email is required."

    if not password:
        errors["password"] = "Password is required."

    return errors, email, password


class AuthHandler(BaseHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        if self.path != "/api/health":
            self.respond(404, {"message": "Not found."})
            return

        self.respond(200, {"status": "ok"})

    def do_POST(self):
        if self.path not in {"/api/signup", "/api/login"}:
            self.respond(404, {"message": "Not found."})
            return

        payload = self.read_json()
        if payload is None:
            return

        users = load_users()

        if self.path == "/api/signup":
            errors, cleaned = validate_signup(payload, users)
            if errors:
                self.respond(400, {"message": "Please fix the highlighted fields.", "errors": errors})
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
            self.respond(400, {"message": "Please fix the highlighted fields.", "errors": errors})
            return

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
        content_length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(content_length) if content_length else b"{}"

        try:
            return json.loads(raw_body.decode("utf-8"))
        except json.JSONDecodeError:
            self.respond(400, {"message": "Request body must be valid JSON."})
            return None

    def respond(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, format, *args):
        return


def run():
    server = ThreadingHTTPServer((HOST, PORT), AuthHandler)
    print(f"Auth server running at http://{HOST}:{PORT}")
    server.serve_forever()


if __name__ == "__main__":
    run()
