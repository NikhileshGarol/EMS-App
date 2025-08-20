from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.schemas.leave import LeaveCreate, LeaveResponse, LeaveApprove, LeaveResponseWithDetails
from app.crud.leave import apply_leave, get_user_leaves, get_all_leaves, approve_leave
from typing import List
from app.utils.auth import get_current_user, allow_roles
from pydantic import BaseModel

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class LeaveApplyRequest(LeaveCreate):
    userId: int

# Employee or admin applies for leave for any userId
@router.post("/apply", response_model=LeaveResponse)
def apply(leave: LeaveApplyRequest, db: Session = Depends(get_db)):
    return apply_leave(db, leave.userId, leave)

# View leaves for any userId
@router.get("/user-leaves", response_model=List[LeaveResponseWithDetails])
def user_leaves(userId: int, db: Session = Depends(get_db)):
    return get_user_leaves(db, userId)

# Admin views all leave applications (optionally filter by userId)
@router.get("/all", response_model=List[LeaveResponseWithDetails])
def all_leaves(userId: int = None, db: Session = Depends(get_db)):
    if userId:
        return get_user_leaves(db, userId)
    return get_all_leaves(db)

# Admin approves/rejects leave
@router.post("/approve", response_model=LeaveResponse)
def approve(userId: int, data: LeaveApprove, db: Session = Depends(get_db)):
    return approve_leave(db, userId, data) 