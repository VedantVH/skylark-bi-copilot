import time
import base64
import json
import hmac
import hashlib

SECRET_KEY = "skylark-bi-copilot-jwt-secret-key-production"


class AuthService:

    @staticmethod
    def create_token(user_id: str, email: str, role: str = "executive") -> str:
        header = {"alg": "HS256", "typ": "JWT"}
        payload = {
            "sub": user_id,
            "email": email,
            "role": role,
            "exp": int(time.time()) + 86400 * 7  # 7 days expiration
        }

        def base64url_encode(data: dict) -> str:
            json_bytes = json.dumps(data).encode("utf-8")
            return base64.urlsafe_b64encode(json_bytes).decode("utf-8").rstrip("=")

        header_b64 = base64url_encode(header)
        payload_b64 = base64url_encode(payload)
        signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")

        signature = hmac.new(
            SECRET_KEY.encode("utf-8"),
            signature_input,
            hashlib.sha256
        ).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode("utf-8").rstrip("=")

        return f"{header_b64}.{payload_b64}.{sig_b64}"

    @staticmethod
    def verify_token(token: str) -> dict | None:
        try:
            parts = token.split(".")
            if len(parts) != 3:
                return None
            header_b64, payload_b64, sig_b64 = parts

            signature_input = f"{header_b64}.{payload_b64}".encode("utf-8")
            expected_sig = hmac.new(
                SECRET_KEY.encode("utf-8"),
                signature_input,
                hashlib.sha256
            ).digest()

            rem = len(sig_b64) % 4
            sig_padded = sig_b64 + ("=" * (4 - rem) if rem else "")
            if not hmac.compare_digest(base64.urlsafe_b64encode(expected_sig).decode("utf-8").rstrip("="), sig_b64):
                return None

            rem_p = len(payload_b64) % 4
            payload_padded = payload_b64 + ("=" * (4 - rem_p) if rem_p else "")
            payload_data = json.loads(base64.urlsafe_b64decode(payload_padded).decode("utf-8"))

            if payload_data.get("exp", 0) < time.time():
                return None

            return payload_data
        except Exception:
            return None
