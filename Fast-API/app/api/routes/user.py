from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Optional
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.user import UserCreate, UserResponse, UserUpdate
from app.crud.user import (
    create_user,
    get_users,
    get_user,
    update_user,
    toggle_user_activation,
)
from typing import List
import time

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/create", response_model=UserResponse)
def create(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)


@router.get("/all-user")
def list_users(
    email: Optional[str] = Query(None),
    phone: Optional[str] = Query(None),
    name: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    active: Optional[bool] = Query(None),
    limit: int = Query(10, ge=1),
    page: int = Query(1, ge=0),
    db: Session = Depends(get_db),
):
    return get_users(
        db,
        email=email,
        phone=phone,
        name=name,
        department=department,
        role=role,
        active=active,
        limit=limit,
        page=page,
    )


@router.get("/{id}", response_model=UserResponse)
def find_user(id: int, db: Session = Depends(get_db)):
    user = get_user(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse(
        **user.__dict__,
        email=user.credential.email if user.credential else "",
        roleId=user.roles[0].id if user.roles else None,
    )


@router.put("/update", response_model=UserUpdate)
def update(user_data: UserUpdate, db: Session = Depends(get_db)):
    return update_user(db, user_data)


@router.delete("/{id}/{status}")
def delete_user(id: int, status: bool, db: Session = Depends(get_db)):
    return toggle_user_activation(id, status, db)
    
# Open endpoint for profile image upload
from fastapi import File, UploadFile
import os
from app.models.user import User

@router.post("/upload-profile-image/{user_id}")
async def upload_profile_image(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Ensure uploads/profile_pics exists
    upload_dir = os.path.join(os.getcwd(), "uploads", "profile_pics")
    os.makedirs(upload_dir, exist_ok=True)
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"user_{user_id}_{int(time.time())}{file_ext}"
    file_path = os.path.join(upload_dir, file_name)
    with open(file_path, "wb") as image:
        content = await file.read()
        image.write(content)
    # Update user profile_image field
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.profile_image = f"uploads/profile_pics/{file_name}"
    db.commit()
    return {"profile_image": user.profile_image}
