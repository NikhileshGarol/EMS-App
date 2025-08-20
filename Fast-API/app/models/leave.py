from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Leave(Base):
    __tablename__ = "Leave"

    id = Column(Integer, primary_key=True, index=True)
    userId = Column(Integer, ForeignKey("User.id", ondelete="CASCADE"), nullable=False)
    startDate = Column(Date, nullable=False)
    endDate = Column(Date, nullable=False)
    reason = Column(String(255), nullable=False)
    status = Column(String(20), default="pending", nullable=False)  # pending/approved/rejected
    appliedAt = Column(DateTime, default=func.now(), nullable=False)
    approvedBy = Column(Integer, ForeignKey("User.id"), nullable=True)
    approvedAt = Column(DateTime, nullable=True)
    leaveType = Column(String(50), nullable=True)  # e.g., sick, casual, etc.
    comments = Column(String(255), nullable=True)
    attachment = Column(String(255), nullable=True)  # file path or URL

    applicant = relationship("User", foreign_keys=[userId], backref="leaves_applied")
    approver = relationship("User", foreign_keys=[approvedBy], backref="leaves_approved") 