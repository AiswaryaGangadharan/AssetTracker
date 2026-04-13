from sqlalchemy import Column, Integer, String, ForeignKey, Date, DateTime, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    role = Column(String, default="employee")
    initials = Column(String)
    department = Column(String, nullable=True)
    password_hash = Column(String)
    
    assets = relationship("Asset", back_populates="assignee")
    requests = relationship("Request", back_populates="user")

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    type = Column(String)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)
    status = Column(String, default="available") # match mock_db
    date = Column(Date)
    notes = Column(Text, nullable=True)

    assignee = relationship("User", back_populates="assets")
    logs = relationship("ActivityLog", back_populates="asset")

class Request(Base):
    __tablename__ = "requests"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    asset_type = Column(String)
    reason = Column(Text)
    status = Column(String, default="pending")
    timestamp = Column(DateTime, server_default=func.now())

    user = relationship("User", back_populates="requests")

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String, primary_key=True, index=True)
    asset_id = Column(String, ForeignKey("assets.id"))
    action = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    timestamp = Column(DateTime, server_default=func.now())
    notes = Column(Text, nullable=True)

    asset = relationship("Asset", back_populates="logs")
