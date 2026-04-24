-- NexusEstate Seed Data Script
-- Demonstrates a complex 4-way lease swap chain across major Indian cities
-- User A (Delhi) -> User B (Mumbai) -> User C (Kolkata) -> User D (Bengaluru) -> User A (Delhi)

-- Clean up existing data
TRUNCATE TABLE Users, Properties, Swap_Requests, Successful_Swaps, Swap_Log_Entries RESTART IDENTITY CASCADE;

-- 1. Create Users
INSERT INTO Users (google_id, email, full_name) VALUES
('google_id_A', 'userA@example.com', 'Aarav Sharma'),
('google_id_B', 'userB@example.com', 'Vivaan Patel'),
('google_id_C', 'userC@example.com', 'Aditya Singh'),
('google_id_D', 'userD@example.com', 'Diya Reddy');

-- 2. Create Properties
-- All properties are available for the overlapping month of '2026-05-01' to '2026-05-31'
-- This tests the GiST daterange index effectively.
INSERT INTO Properties (owner_id, address, city, availability_window) VALUES
(1, '123 Connaught Place', 'Delhi', '[2026-05-01, 2026-05-31]'),
(2, '456 Bandra West', 'Mumbai', '[2026-04-15, 2026-06-15]'),     -- Overlaps with May
(3, '789 Park Street', 'Kolkata', '[2026-05-01, 2026-05-20]'),    -- Overlaps with May (ends early but valid overlap)
(4, '101 Indiranagar', 'Bengaluru', '[2026-05-10, 2026-06-01]');  -- Overlaps with May (starts late but valid overlap)

-- 3. Create Swap Requests forming the 4-way Cycle
-- User A (Delhi) wants to go to Mumbai
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window, is_active) VALUES
(1, 1, 'Mumbai', '[2026-05-12, 2026-05-18]', TRUE);

-- User B (Mumbai) wants to go to Kolkata
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window, is_active) VALUES
(2, 2, 'Kolkata', '[2026-05-12, 2026-05-18]', TRUE);

-- User C (Kolkata) wants to go to Bengaluru
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window, is_active) VALUES
(3, 3, 'Bengaluru', '[2026-05-12, 2026-05-18]', TRUE);

-- User D (Bengaluru) wants to go to Delhi (Completing the 4-way cycle)
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window, is_active) VALUES
(4, 4, 'Delhi', '[2026-05-12, 2026-05-18]', TRUE);

-- Noise Data: Adding some other random requests that do NOT form cycles
INSERT INTO Users (google_id, email, full_name) VALUES
('google_id_E', 'userE@example.com', 'Rohan Gupta'),
('google_id_F', 'userF@example.com', 'Sneha Desai');

INSERT INTO Properties (owner_id, address, city, availability_window) VALUES
(5, '555 Chennai Central', 'Chennai', '[2026-08-01, 2026-08-31]'),
(6, '777 Pune IT Park', 'Pune', '[2026-09-01, 2026-09-30]');

-- User E wants to go to Pune, User F wants to go to Hyderabad (No cycle, breaks chain)
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window, is_active) VALUES
(5, 5, 'Pune', '[2026-08-10, 2026-08-20]', TRUE),
(6, 6, 'Hyderabad', '[2026-09-10, 2026-09-20]', TRUE);

-- How to run this file to verify the system:
-- 1. psql -U postgres -d nexusestate -f backend/database/schema.sql
-- 2. psql -U postgres -d nexusestate -f backend/database/seed.sql
-- 3. Query `SELECT * FROM Swap_Requests WHERE is_active = TRUE;`
-- 4. Send those active requests to the Python `/api/cycles/detect` endpoint to find the cycle.
-- 5. Send the found cycle IDs to the Node.js `/api/swaps/execute` endpoint.
-- 6. Check `SELECT * FROM Swap_Requests;` (is_active should be FALSE for the 4-way cycle requests).
-- 7. Check `SELECT * FROM Successful_Swaps;` to see the transaction log.
