from functools import lru_cache

import httpx
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import jwt

from app.core.config import settings

bearer = HTTPBearer(auto_error=False)


@lru_cache(maxsize=1)
def jwks() -> dict:
    if not settings.clerk_jwks_url:
        return {}
    return httpx.get(settings.clerk_jwks_url, timeout=5).json()


def current_user(token: HTTPAuthorizationCredentials | None = Depends(bearer)) -> str:
    if not settings.clerk_jwks_url:
        return "dev-user"
    if not token:
        raise HTTPException(status_code=401, detail="Missing bearer token")
    try:
        payload = jwt.decode(
            token.credentials,
            jwks(),
            algorithms=["RS256"],
            issuer=settings.clerk_issuer,
            options={"verify_aud": False},
        )
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc
    return payload["sub"]
