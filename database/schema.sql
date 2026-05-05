-- Schema for Asset Tracker
-- Matches SQLAlchemy models in app/models/domain.py

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS issues;
DROP TABLE IF EXISTS assignments;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    username VARCHAR UNIQUE NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'employee',
    initials VARCHAR,
    department VARCHAR,
    hashed_password VARCHAR NOT NULL
);

-- Assets table
CREATE TABLE assets (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'available',
    notes TEXT,
    assignee_id INTEGER REFERENCES users(id)
);

-- Assignments table (NEW)
CREATE TABLE assignments (
    id VARCHAR PRIMARY KEY,
    asset_id VARCHAR NOT NULL REFERENCES assets(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date DATE,
    return_date DATE,
    status VARCHAR DEFAULT 'active'
);

-- Requests table (asset_requests)
CREATE TABLE requests (
    id VARCHAR PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    asset_type VARCHAR NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs table (assignment_history + general)
CREATE TABLE activity_logs (
    id VARCHAR PRIMARY KEY,
    asset_id VARCHAR REFERENCES assets(id),
    action VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Asset Issues table
CREATE TABLE asset_issues (
    id VARCHAR PRIMARY KEY,
    asset_id VARCHAR REFERENCES assets(id),
    user_id INTEGER REFERENCES users(id),
    description TEXT NOT NULL,
    severity VARCHAR DEFAULT 'medium',
    status VARCHAR DEFAULT 'open',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_name ON users(name);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_assets_name ON assets(name);
CREATE INDEX idx_assignments_asset_id ON assignments(asset_id);
CREATE INDEX idx_assignments_user_id ON assignments(user_id);
CREATE INDEX idx_assignments_status ON assignments(status);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_activity_logs_asset_id ON activity_logs(asset_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_asset_issues_asset_id ON asset_issues(asset_id);
CREATE INDEX idx_asset_issues_user_id ON asset_issues(user_id);
CREATE INDEX idx_asset_issues_status ON asset_issues(status);

-- Demo data
-- Users
INSERT INTO users (email, name, username, role, initials, hashed_password, department) VALUES
('admin@company.com', 'System Admin', 'system-admin', 'admin', 'SA', 'hashed_admin123', 'IT'),
('alice@company.com', 'Alice Johnson', 'alice-johnson', 'employee', 'AJ', 'hashed_employee123', 'Engineering'),
('bob@company.com', 'Bob Smith', 'bob-smith', 'employee', 'BS', 'hashed_employee123', 'IT');

-- Assets
INSERT INTO assets (id, name, type, status, notes) VALUES
('AST-001', 'MacBook Pro M3', 'Laptop', 'assigned', 'High performance dev machine'),
('AST-002', 'Dell UltraSharp', 'Monitor', 'assigned', '4K display'),
('AST-003', 'Apple Magic Keyboard', 'Keyboard', 'available', NULL),
('AST-004', 'Logitech MX Keys', 'Keyboard', 'available', NULL),
('AST-005', 'HP LaserJet Printer', 'Printer', 'maintenance', 'Paper jam issue');

-- Assignments
INSERT INTO assignments (id, asset_id, user_id, assigned_date, due_date, status) VALUES
('ASSIGN-001', 'AST-001', 2, CURRENT_TIMESTAMP, '2024-12-31', 'active'),
('ASSIGN-002', 'AST-002', 2, CURRENT_TIMESTAMP, '2024-12-31', 'active'),
('ASSIGN-003', 'AST-004', 3, '2024-03-05', '2024-06-05', 'active');

-- Requests
INSERT INTO requests (id, user_id, asset_type, reason, status) VALUES
('REQ-001', 2, 'Laptop', 'Need replacement for old device', 'approved'),
('REQ-002', 3, 'Monitor', 'Secondary screen needed', 'pending');

-- Activity Logs
INSERT INTO activity_logs (id, asset_id, action, user_id, notes) VALUES
('LOG-001', 'AST-001', 'Assigned', 1, 'Assigned to Alice'),
('LOG-002', 'AST-005', 'Maintenance', 1, 'Printer issue reported');

-- Asset Issues
INSERT INTO asset_issues (id, asset_id, user_id, description, severity) VALUES
('ISSUE-001', 'AST-005', 1, 'Printer paper jam and noise', 'high'),
('ISSUE-002', 'AST-001', 2, 'Battery drain fast', 'low');

