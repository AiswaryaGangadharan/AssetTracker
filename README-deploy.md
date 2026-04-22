# AssetTracker Production Deployment Guide - FIXED

## 🔧 DEPLOYMENT FIXES APPLIED:
- `/health` now tests DB connectivity
- Startup now synchronous (fails fast on bad DB/env)
- `.env.example` created

## Local Test:
```bash
cd assettracker-backend
pip install -r requirements.txt
export DATABASE_URL="sqlite:///./test.db"  # or postgres://...
export SECRET_KEY="testkey123"
uvicorn app.main:app --reload --port 8000
```
Test: curl http://localhost:8000/health  (should show "db": "connected")

## 1. Supabase Postgres
1. Create project if needed
2. Settings > Database > Connection String → Copy DATABASE_URL
3. Run assettracker-backend/database/schema.sql in SQL Editor (optional, init_db creates tables)

## 2. Backend Render.com
1. render.com > New > Web Service > Docker
2. Connect GitHub repo (push changes first)
3. Settings:
   - dockerfilePath: `assettracker-backend/Dockerfile`
4. Environment Variables:
   ```
   DATABASE_URL = [Supabase URL]
   SECRET_KEY   = openssl rand -hex 32 | pbcopy   # Generate strong key
   ```
5. Deploy

## 3. Frontend Vercel
```
cd assettracker-frontend
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend.onrender.com
vercel --prod
```

## ✅ VERIFY DEPLOYMENT:
```bash
HEALTH_URL="https://your-backend.onrender.com/health"
curl $HEALTH_URL   # {"status":"healthy","db":"connected",...}

# Test login endpoint
curl -X POST $HEALTH_URL../api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@company.com","password":"admin123"}'
```

## Troubleshooting:
- ❌ `db: error: ...` → Wrong DATABASE_URL, check Supabase connection
- ❌ No response → Check Render logs for startup errors
- ✅ Works locally → Push & redeploy

Frontend login will work once backend /health shows "db":"connected"!

## 1. Supabase
1. Wait project active
2. SQL editor → paste/run assettracker-backend/database/schema.sql
3. Settings → Database → Connection String → Copy DATABASE_URL

## 2. Backend Render
1. render.com dashboard → New Web Service → Docker
2. Root: /Users/aiswarya/AssetTracker
3. dockerfilePath: assettracker-backend/Dockerfile
4. Env: DATABASE_URL (Supabase), SECRET_KEY (openssl rand -hex 32)
5. Deploy → Get URL e.g. assettracker-abc.onrender.com

## 3. Frontend Vercel
```
cd assettracker-frontend
vercel login  # if needed
vercel --prod
```
Env var: NEXT_PUBLIC_API_URL = https://assettracker-abc.onrender.com
Redeploy.

## Test
- Frontend dashboard loads data from backend/DB
- CRUD ops reflect in Supabase dashboard

URLs:
- Frontend: [Vercel URL]
- Backend: [Render URL]

Done!
