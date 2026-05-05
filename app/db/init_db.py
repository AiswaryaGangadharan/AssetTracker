from sqlalchemy.orm import Session
from app.db.database import engine, Base, SessionLocal
from app.models.domain import User, Asset, ActivityLog
from app.core.security import get_password_hash
from datetime import date, datetime
import uuid
import traceback

def init_db():
    print("🔥 INIT_DB FUNCTION CALLED")
    
    try:
        # 1. Create tables if they don't exist
        print("INFO: Checking/Creating tables...")
        Base.metadata.create_all(bind=engine)
        print("INFO: Tables verified.")
        
        db = SessionLocal()
        try:
            # 2. FORCE Admin user creation/update BEFORE other logic
            admin_email = "admin@company.com"
            print(f"INFO: Verifying admin user: {admin_email}")
            admin = db.query(User).filter(User.email == admin_email).first()
            
            if admin:
                print("INFO: Admin exists - resetting password to ensure validity")
                admin.password_hash = get_password_hash("admin123")
            else:
                print("INFO: Admin user not found. Creating admin user...")
                admin = User(
                    email=admin_email,
                    name="Admin User",
                    role="admin",
                    initials="AD",
                    department="IT Operations",
                    password_hash=get_password_hash("admin123")
                )
                db.add(admin)
            
            # Explicit commit and refresh
            db.commit()
            db.refresh(admin)
            print(f"✅ Admin ready: {admin.email} (ID: {admin.id})")

            # 3. Temporarily disabled demo data seeding for stability
            print("INFO: Demo data seeding is currently disabled for stability.")
            
            print("✅ Database initialization finished successfully.")
                
        except Exception as e:
            print(f"❌ ERROR IN DB DATA OPS: {str(e)}")
            traceback.print_exc()
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ CRITICAL ERROR IN DB INIT: {str(e)}")
        traceback.print_exc()

if __name__ == "__main__":
    init_db()
