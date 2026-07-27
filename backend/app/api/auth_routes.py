from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/auth", tags=["Auth"])


class LoginRequest(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(credentials: LoginRequest):
    # Standard demo executive login (accepts demo credentials or any email for convenience)
    if credentials.email and credentials.password:
        token = AuthService.create_token(
            user_id="user_exec_01",
            email=credentials.email,
            role="Executive Leadership"
        )
        return {
            "token": token,
            "user": {
                "id": "user_exec_01",
                "email": credentials.email,
                "name": credentials.email.split("@")[0].capitalize(),
                "role": "Executive Leadership"
            }
        }
    raise HTTPException(status_code=400, detail="Invalid email or password")


@router.get("/me")
def get_me(authorization: str = Header(None)):
    if not authorization:
        # For public demo view, return default demo user
        return {
            "id": "user_demo",
            "email": "executive@skylark.com",
            "name": "Skylark Executive",
            "role": "Chief Executive"
        }
    token = authorization.replace("Bearer ", "").strip()
    payload = AuthService.verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return {
        "id": payload.get("sub"),
        "email": payload.get("email"),
        "name": payload.get("email", "User").split("@")[0].capitalize(),
        "role": payload.get("role")
    }
