from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.database import engine, Base, SessionLocal
from app.models.domain import User, Asset, ActivityLog
from app.core.security import get_password_hash
from datetime import date, datetime
import uuid

def init_db():
    import traceback
    print(f"[{datetime.now().isoformat()}] INFO: Starting SYNCHRONOUS database initialization...")
    
    try:
        # Safe startup - skip DB if fails (app must start)
        test_conn = engine.connect()
        test_conn.execute(text("SELECT 1"))
        test_conn.close()
        print(f"[{datetime.now().isoformat()}] INFO: DB connection OK")
        
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        print(f"[{datetime.now().isoformat()}] INFO: Tables verified.")
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] WARN: DB init skipped: {e}")
        
        db = SessionLocal()
        try:
            # Check if we already have users
            user_count = db.query(User).count()
            if user_count == 0:
                print(f"[{datetime.now().isoformat()}] INFO: Database is empty. Seeding demo data...")
                
                # Create Demo Admin
                admin = User(
                    email="admin@company.com",
                    name="Admin User",
                    role="admin",
                    initials="AD",
                    department="IT Operations",
                    password_hash=get_password_hash("admin123")
                )
                db.add(admin)
                
                # Create more demo employees
                employees_data = [
                    {"email": "amit@company.com", "name": "Amit Singh", "initials": "AS", "dept": "Engineering", "pwd": "employee123"},
                    {"email": "priya@company.com", "name": "Priya Sharma", "initials": "PS", "dept": "Design", "pwd": "employee123"},
                    {"email": "raj@company.com", "name": "Raj Kumar", "initials": "RK", "dept": "Engineering", "pwd": "employee123"},
                    {"email": "neha@company.com", "name": "Neha Gupta", "initials": "NG", "dept": "HR", "pwd": "employee123"},
                    {"email": "vikram@company.com", "name": "Vikram Malik", "initials": "VM", "dept": "Sales", "pwd": "employee123"},
                ]
                
                employees = []
                for data in employees_data:
                    emp = User(
                        email=data["email"],
                        name=data["name"],
                        role="employee",
                        initials=data["initials"],
                        department=data["dept"],
                        password_hash=get_password_hash(data["pwd"])
                    )
                    db.add(emp)
                    db.flush()  # Get ID
                    employees.append(emp)
                
                db.commit()
                
                # Seed assets (some assigned, some available, maintenance)
                # Using employees[0] for Amit and employees[1] for Priya
                demo_assets = [
                    Asset(id="AST-001", name="MacBook Pro 16\"", type="Laptop", status="assigned", assignee_id=employees[0].id, last_assigned_date=datetime(2024, 1, 15), notes="Amit's primary"),
                    Asset(id="AST-002", name="Dell UltraSharp 27\"", type="Monitor", status="assigned", assignee_id=employees[0].id, last_assigned_date=datetime(2024, 2, 10), notes="Dual monitor"),
                    Asset(id="AST-003", name="iPad Pro 12.9\"", type="Tablet", status="available", notes="Available"),
                    Asset(id="AST-004", name="Logitech MX Keys", type="Keyboard", status="available"),
                    Asset(id="AST-005", name="HP LaserJet Printer", type="Printer", status="maintenance", notes="Paper jam fix needed"),
                    Asset(id="AST-006", name="Samsung 34\" Ultrawide", type="Monitor", status="assigned", assignee_id=employees[1].id, last_assigned_date=datetime(2024, 1, 20)),
                ]
                
                for asset in demo_assets:
                    db.add(asset)
                    db.flush() # Get ID for assignments
                    
                    if asset.status == "assigned":
                        # Create initial assignment record for history
                        from app.models.domain import Assignment
                        db.add(Assignment(
                            id=f"ASGN-INIT-{asset.id}",
                            asset_id=asset.id,
                            user_id=asset.assignee_id,
                            assigned_date=asset.last_assigned_date or datetime.now(),
                            status="active"
                        ))
                
                # Seed sample requests and issues
                from app.models.domain import Request, Issue
                db.add(Request(id="REQ-001", user_id=employees[2].id, asset_type="Laptop", reason="Need for new project", status="pending"))
                db.add(Request(id="REQ-002", user_id=employees[3].id, asset_type="Monitor", reason="Dual setup", status="approved"))
                
                db.add(Issue(id="ISSUE-001", asset_id="AST-005", user_id=employees[0].id, description="Printer not printing, paper jam persistent", severity="high", status="open"))
                db.add(Issue(id="ISSUE-002", asset_id="AST-001", user_id=employees[0].id, description="Battery draining fast", severity="medium", status="resolved"))
                
                db.commit()
                print(f"[{datetime.now().isoformat()}] INFO: Demo data seeded (5 employees, 6 assets, requests/issues).")
                
                db.commit()
                print(f"[{datetime.now().isoformat()}] INFO: Database seeded successfully.")
            else:
                print(f"[{datetime.now().isoformat()}] INFO: Database already contains data ({user_count} users). Skipping seed.")
                
        except Exception as e:
            print(f"[{datetime.now().isoformat()}] ERROR: Data operations failed: {e}")
            db.rollback()
        finally:
            db.close()
            
    except Exception as e:
        print(f"[{datetime.now().isoformat()}] ERROR: Critical database initialization failure: {e}")
    
    print(f"[{datetime.now().isoformat()}] INFO: Database initialization background task finished.")

