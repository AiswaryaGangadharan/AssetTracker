from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    name = Column(String, index=True)
    role = Column(String, default="employee")
    initials = Column(String)
    department = Column(String, nullable=True)
    password_hash = Column(String)
    
    assets = relationship("Asset", back_populates="assignee")
    requests = relationship("Request", back_populates="user")
    assignments = relationship("Assignment", back_populates="user")
    issues = relationship("Issue", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "role": self.role,
            "initials": self.initials,
            "department": self.department
        }

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    status = Column(String, default="available")
    notes = Column(Text, nullable=True)
    last_assigned_date = Column(DateTime, nullable=True)

    assignee_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assignee = relationship("User", back_populates="assets")
    logs = relationship("ActivityLog", back_populates="asset")
    assignments = relationship("Assignment", back_populates="asset")
    issues = relationship("Issue", back_populates="asset")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "status": self.status,
            "notes": self.notes,
            "assignee_id": self.assignee_id,
            "last_assigned_date": self.last_assigned_date,
            "assignee_name": self.assignee.name if self.assignee else ("Unassigned" if self.status == 'available' or not self.assignee_id else "User ID " + str(self.assignee_id))
        }


class Assignment(Base):
    __tablename__ = "assignments"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    assigned_date = Column(DateTime, server_default=func.now())
    due_date = Column(Date, nullable=True)
    return_date = Column(Date, nullable=True)
    status = Column(String, default="active")  # active, overdue, returned

    asset = relationship("Asset", back_populates="assignments")
    user = relationship("User", back_populates="assignments")

    def to_dict(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "user_id": self.user_id,
            "assigned_date": self.assigned_date,
            "due_date": self.due_date,
            "return_date": self.return_date,
            "status": self.status,
            "user_name": self.user.name if self.user else "Unknown"
        }

class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    asset_type = Column(String)
    reason = Column(Text)
    status = Column(String, default="pending")
    timestamp = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="requests")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "asset_type": self.asset_type,
            "reason": self.reason,
            "status": self.status,
            "timestamp": self.timestamp,
            "user_name": self.user.name if self.user else "Unknown",
            "user_email": self.user.email if self.user else "Unknown"
        }


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    action = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, server_default=func.now())
    notes = Column(Text, nullable=True)

    asset = relationship("Asset", back_populates="logs")

    def to_dict(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "action": self.action,
            "user_id": self.user_id,
            "timestamp": self.timestamp,
            "notes": self.notes
        }

class Issue(Base):
    __tablename__ = "asset_issues"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    description = Column(Text)
    severity = Column(String, default="medium")
    status = Column(String, default="open")
    timestamp = Column(DateTime, server_default=func.now())

    asset = relationship("Asset", back_populates="issues")
    user = relationship("User", back_populates="issues")

    def to_dict(self):
        return {
            "id": self.id,
            "asset_id": self.asset_id,
            "user_id": self.user_id,
            "description": self.description,
            "severity": self.severity,
            "status": self.status,
            "timestamp": self.timestamp,
            "asset_name": self.asset.name if self.asset else "Unknown",
            "user_name": self.user.name if self.user else "Unknown"
        }



