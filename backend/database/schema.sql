-- NexusEstate Database Schema
-- DBMS Project Focus: Transactions, Concurrency Control, and Advanced Indexing

-- Enable the btree_gist extension for combining B-Tree and GiST indexing if needed
-- CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 1. Users Table
CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Properties Table
-- Stores the properties currently held by users and their availability daterange.
CREATE TABLE Properties (
    id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    -- PostgreSQL daterange type is perfect for booking/availability windows
    availability_window DATERANGE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Advanced Indexing: GiST Index for fast overlap (&&) queries on availability windows
-- This demonstrates a core DBMS concept for spatial/range queries.
CREATE INDEX idx_properties_availability_gist ON Properties USING GIST (availability_window);
CREATE INDEX idx_properties_city ON Properties(city);

-- 3. Swap_Requests Table
-- Acts as the directed edge in our Graph for the arbitrage engine.
-- If User A has Property X in NY and wants to move to SF between dates, this records the desire.
CREATE TABLE Swap_Requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES Users(id) ON DELETE CASCADE,
    current_property_id INTEGER NOT NULL REFERENCES Properties(id) ON DELETE CASCADE,
    desired_city VARCHAR(100) NOT NULL,
    desired_window DATERANGE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Successful_Swaps Table
-- Acts as a transaction log for completed cycles.
CREATE TABLE Successful_Swaps (
    swap_group_id UUID PRIMARY KEY, -- Unique ID for the 3-way or 4-way swap
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    participant_count INTEGER NOT NULL CHECK (participant_count IN (2, 3, 4)),
    status VARCHAR(50) DEFAULT 'COMPLETED'
);

-- Link table to map which properties were involved in which swap group
CREATE TABLE Swap_Log_Entries (
    id SERIAL PRIMARY KEY,
    swap_group_id UUID NOT NULL REFERENCES Successful_Swaps(swap_group_id),
    user_id INTEGER NOT NULL REFERENCES Users(id),
    property_id INTEGER NOT NULL REFERENCES Properties(id)
);
