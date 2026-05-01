-- Enable necessary extension for DATERANGE GiST indexing
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- ENUM for User Roles
CREATE TYPE user_role AS ENUM ('tenant', 'landlord', 'admin');

-- 1. Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    google_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'tenant',
    verified_status BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties Table
CREATE TABLE Properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    city VARCHAR(255) NOT NULL,
    listed_price NUMERIC(10, 2) NOT NULL CHECK (listed_price > 0),
    true_valuation NUMERIC(10, 2),
    is_fraud_flagged BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Leases Table
CREATE TABLE Leases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES Properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    availability_window DATERANGE GENERATED ALWAYS AS (daterange(start_date, end_date, '[]')) STORED,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_lease_dates CHECK (start_date <= end_date)
);

-- GiST Index for fast spatial/temporal overlap queries on Leases
CREATE INDEX idx_leases_availability_window ON Leases USING gist (availability_window);

-- 4. Swap_Requests Table
CREATE TABLE Swap_Requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    current_lease_id UUID NOT NULL REFERENCES Leases(id) ON DELETE CASCADE,
    desired_window DATERANGE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- GiST Index for fast spatial/temporal overlap queries on Swap_Requests
CREATE INDEX idx_swap_requests_desired_window ON Swap_Requests USING gist (desired_window);

-- 5. Swap_Transactions Table
CREATE TABLE Swap_Transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    lease_chain JSONB NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
