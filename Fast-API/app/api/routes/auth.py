from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.user import UserResponse
from sqlalchemy.orm import joinedload
from app.crud.user import create_user, get_users
from typing import List
from app.schemas.auth import LoginRequest, Token
from app.models.userCredential import UserCredential
from app.models.user import User
from app.models.userRole import user_role
from app.utils.auth import verify_password, create_tokens
from fastapi import HTTPException, status
from app.utils import auth
from jose import jwt, JWTError
from datetime import timedelta

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/login")
def login(request: LoginRequest, db: Session = Depends(get_db)):
    print(request)
    user_cred = (
        db.query(UserCredential)
        .options(
            joinedload(UserCredential.user).joinedload(
                User.roles
            )  # if User has a `roles = relationship(...)`
        )
        .filter(UserCredential.email == request.email)
        .first()
    )
    print(user_cred)
    if not user_cred or not verify_password(request.password, user_cred.hashedPassword):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    access_token = create_tokens(
        data={
            "email": user_cred.email,
            "userId": user_cred.userId,
            "roles": [
                {"roleId": role.id, "name": role.name} for role in user_cred.user.roles
            ],
        }
    )
    print(access_token)
    return {
        "access_token": (
            access_token["access_token"] if access_token.get("access_token") else None
        ),
        "refresh_token": (
            access_token["refresh_token"] if access_token.get("refresh_token") else None
        ),
        "firstName": user_cred.user.firstName,
        "lastName": user_cred.user.lastName,
        "email": user_cred.email,
        "userId": user_cred.userId,
        "roles": [
            {"roleId": role.id, "name": role.name} for role in user_cred.user.roles
        ],
        "phone": user_cred.user.phone,
        "departmentId": user_cred.user.departmentId,
        "managerId": user_cred.user.managerId,
        "status": user_cred.user.active,
        "profile_image": user_cred.user.profile_image,
    }

@router.post("/refresh-token")
def refresh_access_token(refresh_token: str):
    """
    Validates the refresh token and issues a new access token.
    """
    try:
        payload = jwt.decode(refresh_token, auth.SECRET_KEY, algorithms=[auth.ALGORITHM])
        
        # Ensure the token is actually a refresh token
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        # Extract user details from the payload
        email = payload.get("email")
        user_id = payload.get("userId")
        roles = payload.get("roles")

        if not email or not user_id:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        # Create a new access token (only)
        new_access_token = auth.create_access_token(
            data={"email": email, "userId": user_id, "roles": roles},
            expires_delta=timedelta(minutes=auth.ACCESS_TOKEN_EXPIRE_MINUTES)
        )

        return {
            "access_token": new_access_token,
            "token_type": "bearer"
        }

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")
    
@router.get("/all-user", response_model=List[UserResponse])
def list_users(db: Session = Depends(get_db)):
    return get_users(db)
