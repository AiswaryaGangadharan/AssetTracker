-- Schema for Asset Tracker
-- This matches the SQLAlchemy models in app/models/domain.py

-- Drop tables if they exist (clean setup)
DROP TABLE IF EXISTS activity_logs;
DROP TABLE IF EXISTS requests;
DROP TABLE IF EXISTS assets;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    role VARCHAR NOT NULL DEFAULT 'employee',
    initials VARCHAR,
    hashed_password VARCHAR NOT NULL
);

-- Assets table
CREATE TABLE assets (
    id VARCHAR PRIMARY KEY,
    name VARCHAR NOT NULL,
    type VARCHAR NOT NULL,
    assigned_to INTEGER REFERENCES users(id),
    status VARCHAR NOT NULL DEFAULT 'available',
    date DATE NOT NULL,
    notes TEXT
);

-- Requests table
CREATE TABLE requests (
    id VARCHAR PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    asset_type VARCHAR NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs table
CREATE TABLE activity_logs (
    id VARCHAR PRIMARY KEY,
    asset_id VARCHAR REFERENCES assets(id),
    action VARCHAR NOT NULL,
    user_id INTEGER REFERENCES users(id),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    notes TEXT
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_assets_name ON assets(name);
CREATE INDEX idx_assets_assigned_to ON assets(assigned_to);
CREATE INDEX idx_requests_user_id ON requests(user_id);
CREATE INDEX idx_activity_logs_asset_id ON activity_logs(asset_id);
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
