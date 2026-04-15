# Run AssetTracker (Production-Ready)

## Backend
```bash
cd assettracker-backend
pip install -r requirements.txt  # if not
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
API ready: http://localhost:8000/docs (Swagger)

## Frontend
```bash
cd assettracker-frontend
npm install
npm run dev
```
App: http://localhost:3000

## Demo
- Register/Login admin@company.com/admin123 or amit@company.com/employee123
- Test CRUD, roles, history, issues - all persist in SQLite DB.

## Prod
- Backend .env DATABASE_URL=postgres
- Frontend .env.local NEXT_PUBLIC_API_URL=backend-url
- Deploy Render/Vercel/Docker.

No errors, full integration complete!

