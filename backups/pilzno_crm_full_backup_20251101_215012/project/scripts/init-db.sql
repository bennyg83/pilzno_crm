-- Pilzno Synagogue Management System - Database Initialization
-- This script initializes the database schema

-- Create database if it doesn't exist (PostgreSQL will handle this automatically)
-- The TypeORM entities will create the tables when the backend starts

-- Set timezone
SET timezone = 'UTC';

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE pilzno_synagogue TO synagogue_admin;

-- Log initialization
SELECT 'Pilzno Synagogue Database initialized successfully' as status;
