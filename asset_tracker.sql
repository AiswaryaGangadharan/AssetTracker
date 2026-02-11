-- Employees table
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    department VARCHAR(50),
    role VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assets table
CREATE TABLE assets (
    id SERIAL PRIMARY KEY,
    asset_name VARCHAR(100),
    asset_type VARCHAR(50),
    asset_tag VARCHAR(50),
    status VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Asset Assignments table
CREATE TABLE asset_assignments (
    id SERIAL PRIMARY KEY,
    asset_id INT,
    employee_id INT,
    assigned_date DATE,
    returned_date DATE
);

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    employee_id INT,
    username VARCHAR(50),
    role VARCHAR(20)
);

-- Dummy data for employees
INSERT INTO employees (name, email, department, role)
VALUES
('Amit Kumar', 'amit@company.com', 'IT', 'employee'),
('Sneha Rao', 'sneha@company.com', 'HR', 'admin');

-- Dummy data for assets
INSERT INTO assets (asset_name, asset_type, asset_tag, status)
VALUES
('Dell Laptop', 'Hardware', 'DL-1001', 'assigned'),
('iPhone', 'Hardware', 'IP-2001', 'available');

-- Dummy data for asset assignments
INSERT INTO asset_assignments (asset_id, employee_id, assigned_date, returned_date)
VALUES
(1, 1, '2026-02-01', NULL);
