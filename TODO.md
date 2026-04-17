# AssetTracker Deployment TODO
Status: In Progress

## Approved Plan Steps

### 1. [✅] Ensure latest code pushed to GitHub
   - `git add . && git commit -m "Prepare for deployment" && git push`

### 2. [ ] Backend Deploy to Render (Docker)
   - User: render.com → New → Web Service → Connect GitHub repo
   - Root: /Users/aiswarya/AssetTracker, dockerfilePath: assettracker-backend/Dockerfile
   - Env: DATABASE_URL (Supabase), SECRET_KEY=openssl rand -hex 32
   - Get backend URL

### 3. [ ] Frontend Deploy to Vercel
   - `cd assettracker-frontend`
   - `vercel --prod`
   - Set NEXT_PUBLIC_API_URL = [backend-url-from-step-2]

### 4. [ ] Test End-to-End LIVE
   - Admin/Employee login
   - CRUD: assets, requests, assignments, issues

### 5. [ ] Fix issues if any (CORS/env)

### 6. [ ] Complete ✅
   - Provide URLs + confirmation
