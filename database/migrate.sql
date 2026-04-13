-- SQLite Migration: Rename 'name' to 'username' in 'users' table

-- Step 1: Create the new table schema with the exact new definition
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR UNIQUE,
    username VARCHAR UNIQUE,
    role VARCHAR DEFAULT 'employee',
    initials VARCHAR,
    department VARCHAR,
    password_hash VARCHAR
);

-- Step 2: Copy data from the old table (mapping 'name' to 'username' temporarily)
INSERT INTO users_new (id, email, username, role, initials, department, password_hash)
SELECT id, email, name, role, initials, department, password_hash
FROM users;

-- Step 3: Drop the original table
DROP TABLE users;

-- Step 4: Rename the new table to the original name
ALTER TABLE users_new RENAME TO users;

-- Step 5: Recreate indexes
CREATE INDEX ix_users_id ON users (id);
CREATE UNIQUE INDEX ix_users_email ON users (email);
CREATE UNIQUE INDEX ix_users_username ON users (username);
