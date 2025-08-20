from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class LeaveBase(BaseModel):
    startDate: date
    endDate: date
    reason: str
    leaveType: Optional[str] = None
    comments: Optional[str] = None
    attachment: Optional[str] = None

class LeaveCreate(LeaveBase):
    pass

class LeaveApprove(BaseModel):
    leaveId: int
    approve: bool  # True for approve, False for reject
    comments: Optional[str] = None

class LeaveResponse(LeaveBase):
    id: int
    userId: int
    status: str
    appliedAt: datetime
    approvedBy: Optional[int] = None
    approvedAt: Optional[datetime] = None

    class Config:
        orm_mode = True

class LeaveResponseWithDetails(LeaveBase):
    id: int
    userId: int
    userName: str
    status: str
    appliedAt: datetime
    approvedBy: Optional[int] = None
    approvedAt: Optional[datetime] = None
    approvedByName: Optional[str] = None
    daysApplied: int

    class Config:
        orm_mode = True 