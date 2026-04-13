from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.domain import User, Asset, ActivityLog
from passlib.context import CryptContext
from datetime import date
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_db():
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if we already have users
        user_count = db.query(User).count()
        if user_count == 0:
            print("Seeding database with demo data...")
            
            # Create Demo Admin
            admin = User(
                email="admin@company.com",
                name="Admin User",
                role="admin",
                initials="AD",
                department="IT Operations",
                hashed_password=pwd_context.hash("admin123")
            )
            db.add(admin)
            
            # Create Demo Employee
            employee = User(
                email="amit@company.com",
                name="Amit Singh",
                role="employee",
                initials="AS",
                department="Engineering",
                hashed_password=pwd_context.hash("employee123")
            )
            db.add(employee)
            
            db.commit()
            db.refresh(admin)
            db.refresh(employee)
            
            # Seed some initial assets
            demo_assets = [
                Asset(
                    id="AST-001",
                    name="MacBook Pro 16\"",
                    type="Laptop",
                    status="assigned",
                    assigned_to=employee.id,
                    date=date(2023, 5, 15),
                    notes="Primary workstation for Amit."
                ),
                Asset(
                    id="AST-002",
                    name="Dell UltraSharp 27\"",
                    type="Monitor",
                    status="assigned",
                    assigned_to=employee.id,
                    date=date(2023, 6, 12),
                    notes="Dual setup monitor."
                ),
                Asset(
                    id="AST-003",
                    name="iPad Pro 11\"",
                    type="Tablet",
                    status="available",
                    date=date(2024, 1, 10),
                    notes="Testing device."
                ),
                Asset(
                    id="AST-004",
                    name="Logitech MX Master 3",
                    type="Peripheral",
                    status="available",
                    date=date(2023, 11, 20)
                )
            ]
            
            for asset in demo_assets:
                db.add(asset)
            
            db.commit()
            print("Database seeded successfully.")
        else:
            print("Database already contains data, skipping seed.")
            
    except Exception as e:
        print(f"Error initializing database: {e}")
        db.rollback()
    finally:
        db.close()
