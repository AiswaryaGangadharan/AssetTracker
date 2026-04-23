# TODO: Fix Deployment Bcrypt Error
- [ ] Step 1: Create this TODO file ✅
- [x] Step 2: Edit app/db/mock_db.py (add [:72] to all 4 pwd_context.hash calls)\n- [x] Step 3: Edit app/core/security.py (truncate in get_password_hash)
- [x] Step 4: Edit assettracker-backend/app/db/mock_db.py (consistency)
- [ ] Step 5: Test locally (uvicorn main:app --reload in app/)
- [ ] Step 6: Commit and redeploy to Render

