# AssetTracker Localhost Complete Setup
Status: 🔄 Backend Fixes → Test → Frontend → Full Integration

## 🎯 Backend Fixes [✅ COMPLETE]
- [ ] 1. config.py: SQLite fallback `sqlite:///./asset_tracker.db`
- [ ] 2. main.py: `from app.db.database import SessionLocal`
- [ ] 3. Fix datetime.now().isoformat() timestamps

## 🧪 Backend Test Commands
```bash
curl http://localhost:8000/health   # → {\"status\":\"healthy\",\"db\":\"connected\"}
curl http://localhost:8000/docs     # → Swagger UI loads
curl -X POST http://localhost:8000/api/auth/login \\
  -H \"Content-Type: application/json\" \\
  -d '{\"email\":\"admin@company.com\",\"password\":\"admin123\"}'
```

## 🚀 Backend Run Commands (Terminal 1)
```bash
cd /Users/aiswarya/AssetTracker/assettracker-backend
rm -rf venv  # Clean previous
python -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

## 🌐 Frontend Run Commands (Terminal 2)  
```bash
cd /Users/aiswarya/AssetTracker/assettracker-frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## ✅ Success Checklist
- [ ] Backend: http://localhost:8000/health → \"db\":\"connected\"
- [ ] Backend: http://localhost:8000/docs → Swagger + /api routes
- [ ] Frontend: http://localhost:3000 → Loads without errors
- [ ] Login: admin@company.com / admin123 → Redirects to dashboard/admin
- [ ] Dashboard: Shows assets, assignments, requests (demo data loaded)

## 🔐 Test Credentials
```
Email: admin@company.com
Password: admin123
Other users: amit@company.com/employee123 etc.
```

## Known Demo Data (auto-seeded)
- 6 Assets (assigned, available, maintenance)
- 5 Employees  
- Requests + Issues

**Next: Backend file edits complete → Local test → Mark progress**
Progress: 25%

