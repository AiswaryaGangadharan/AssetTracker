# Login + Registration Flow TODO

## Plan Steps (Approved ✅)

### 1. Backend Auth Endpoints ✅
- [x] `assettracker-backend/app/api/routes/auth.py`: Full /register (name as username, role, hash, token), /login (email/pass opt role, verify, token w/role). Schemas ready.

### 2. Frontend API.ts ✅
- [x] `assettracker-frontend/src/lib/api.ts`: Added typed `registerUser`, `loginUser` + fixed ESLint (unknown/RequestInit).

### 3. Frontend Register Page
- [ ] `assettracker-frontend/src/app/(auth)/register/page.tsx`: Form (Input name/email/pass, Select role admin/employee, Button submit → API → redirect login).

### 4. Frontend Login Page Update
- [ ] `assettracker-frontend/src/app/(auth)/login/page.tsx`: Remove role, email/pass only → loginUser → useEffect user.role ? redirect /dashboard/{role} : /login.

### 5. AuthContext + Guards
- [ ] Update context for role-based redirect post-login.

### 6. Testing
- Register admin/employee → DB saved → login → auto dashboard.

Next: Explore auth files.

