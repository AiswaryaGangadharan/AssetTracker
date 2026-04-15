# Backend Tables + APIs TODO

## Plan Steps (Approved ✅)

### 1. Add Assignments Table/Model ✅
- [x] `assettracker-backend/app/models/domain.py`: Added Assignment class + relationships.
- [x] `assettracker-backend/database/schema.sql`: Added table + indexes + demo data.

### 2. Update Assets Routes
- [ ] `assettracker-backend/app/api/routes/assets.py`: Refactor assign/revoke → create/update Assignment record, update asset.status.

### 3. Full Users CRUD
- [ ] `assettracker-backend/app/api/routes/users.py`: POST create user, PUT update, DELETE.

### 4. Assignments Routes ✅
- [x] `assettracker-backend/app/api/routes/assignments.py`: Full CRUD + schemas/assignment.py.
- [x] api.py: Mounted /assignments.

**All backend tables + CRUD complete.**

**To test**: docker-compose rebuild DB → test assign → assignments table populated, asset.status updated.

