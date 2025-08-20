from sqlalchemy.orm import Session
from app.models.leave import Leave
from app.schemas.leave import LeaveCreate, LeaveApprove
from fastapi import HTTPException
from datetime import datetime, date
from app.models.user import User

# Employee applies for leave
def apply_leave(db: Session, user_id: int, leave):
    data = leave.model_dump()
    data.pop("userId", None)
    db_leave = Leave(userId=user_id, **data)
    db.add(db_leave)
    db.commit()
    db.refresh(db_leave)
    return db_leave

# Get all leaves for a user with details
def get_user_leaves(db: Session, user_id: int):
    leaves = db.query(Leave).filter(Leave.userId == user_id).all()
    result = []
    for leave in leaves:
        days = (leave.endDate - leave.startDate).days + 1
        approved_by_name = None
        if leave.approvedBy:
            approver = db.query(User).filter(User.id == leave.approvedBy).first()
            if approver:
                approved_by_name = f"{approver.firstName} {approver.lastName}"
        
        # Get applicant name
        applicant = db.query(User).filter(User.id == leave.userId).first()
        user_name = f"{applicant.firstName} {applicant.lastName}" if applicant else "Unknown"
        
        result.append({
            **leave.__dict__,
            'approvedByName': approved_by_name,
            'userName': user_name,
            'daysApplied': days
        })
    return result

# Admin: get all leave applications with details
def get_all_leaves(db: Session):
    leaves = db.query(Leave).all()
    result = []
    for leave in leaves:
        days = (leave.endDate - leave.startDate).days + 1
        approved_by_name = None
        if leave.approvedBy:
            approver = db.query(User).filter(User.id == leave.approvedBy).first()
            if approver:
                approved_by_name = f"{approver.firstName} {approver.lastName}"
        
        # Get applicant name
        applicant = db.query(User).filter(User.id == leave.userId).first()
        user_name = f"{applicant.firstName} {applicant.lastName}" if applicant else "Unknown"
        
        result.append({
            **leave.__dict__,
            'approvedByName': approved_by_name,
            'userName': user_name,
            'daysApplied': days
        })
    return result

# Admin: approve or reject leave
def approve_leave(db: Session, admin_id: int, data: LeaveApprove):
    db_leave = db.query(Leave).filter(Leave.id == data.leaveId).first()
    if not db_leave:
        raise HTTPException(status_code=404, detail="Leave not found")
    if db_leave.status != "pending":
        raise HTTPException(status_code=400, detail="Leave already processed")
    db_leave.status = "approved" if data.approve else "rejected"
    db_leave.approvedBy = admin_id
    db_leave.approvedAt = datetime.utcnow()
    if data.comments:
        db_leave.comments = data.comments
    db.commit()
    db.refresh(db_leave)
    return db_leave 