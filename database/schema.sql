-- NexusEstate PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE Users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role VARCHAR(50) NOT NULL CHECK (role IN ('Nomad', 'Investor')),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    verified_status BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Properties Table
CREATE TABLE Properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    listed_price DECIMAL(12, 2) NOT NULL CHECK (listed_price >= 0),
    location VARCHAR(255) NOT NULL,
    true_valuation DECIMAL(12, 2), -- Populated via AI Microservice
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Leases Table
CREATE TABLE Leases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID NOT NULL REFERENCES Properties(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_lease_dates CHECK (end_date > start_date)
);

-- Swap Transactions Table
CREATE TABLE Swap_Transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    status VARCHAR(50) NOT NULL CHECK (status IN ('PENDING_COMMIT', 'COMMITTED', 'ROLLED_BACK')),
    lease_chain JSONB NOT NULL, -- Array of lease IDs involved in the swap loop
    expires_at TIMESTAMP WITH TIME ZONE, -- Used for the 60-second commit window
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_properties_owner ON Properties(owner_id);
CREATE INDEX idx_leases_property ON Leases(property_id);
CREATE INDEX idx_leases_tenant ON Leases(tenant_id);
CREATE INDEX idx_swap_transactions_status ON Swap_Transactions(status);
