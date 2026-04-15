# AssetTracker Production Deployment Guide

## Local Testing (Current Status: Backend running on :8000)

Backend: http://localhost:8000/health
Frontend: http://localhost:3000 (run npm run dev)

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
