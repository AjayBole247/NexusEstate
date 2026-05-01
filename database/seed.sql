-- =============================================================================
-- FILE: backend/database/seed.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: Sample data for development and QA.
--              Includes a COMPLETE 4-WAY SWAP CYCLE for testing the engine:
--                User A (Delhi)     wants → Mumbai
--                User B (Mumbai)    wants → Kolkata
--                User C (Kolkata)   wants → Bengaluru
--                User D (Bengaluru) wants → Delhi
--              All availability_window / desired_window values overlap in
--              May 2026 so the matching CTE in queries.sql resolves the loop.
--
--              Also includes one ₹2,000 Mumbai listing to exercise the fraud
--              detection trigger and query.
-- =============================================================================

-- Clean slate for repeatable seeding (order respects FK dependencies)
TRUNCATE TABLE
    Swap_Log_Entries,
    Successful_Swaps,
    Swap_Requests,
    Properties,
    Users
RESTART IDENTITY CASCADE;


-- =============================================================================
-- 1. USERS
-- =============================================================================

INSERT INTO Users (google_id, email, full_name) VALUES
-- ── 4-way cycle participants (IDs 1-4) ──────────────────────────────────────
('google_uid_arjun_sharma',   'arjun.sharma@gmail.com',   'Arjun Sharma'),      -- 1 Delhi
('google_uid_priya_mehta',    'priya.mehta@gmail.com',    'Priya Mehta'),       -- 2 Mumbai
('google_uid_rohan_das',      'rohan.das@gmail.com',      'Rohan Das'),         -- 3 Kolkata
('google_uid_divya_nair',     'divya.nair@gmail.com',     'Divya Nair'),        -- 4 Bengaluru

-- ── Additional platform users ────────────────────────────────────────────────
('google_uid_kabir_singh',    'kabir.singh@gmail.com',    'Kabir Singh'),       -- 5 Hyderabad
('google_uid_meera_iyer',     'meera.iyer@gmail.com',     'Meera Iyer'),        -- 6 Chennai
('google_uid_sameer_gupta',   'sameer.gupta@gmail.com',   'Sameer Gupta'),      -- 7 Pune
('google_uid_anita_bose',     'anita.bose@gmail.com',     'Anita Bose'),        -- 8 Kolkata (2nd)
('google_uid_rahul_verma',    'rahul.verma@gmail.com',    'Rahul Verma'),       -- 9 Delhi (2nd)
('google_uid_fraud_tester',   'fraud.tester@example.com', 'Fraud Test User');   -- 10 Mumbai fraud listing


-- =============================================================================
-- 2. PROPERTIES
--    NOTE: availability_window is the active lease window (replaces Leases).
--          All 4-way cycle windows cover [2026-05-01, 2026-06-01) so they
--          guarantee overlap for May 2026 matching.
-- =============================================================================

INSERT INTO Properties (owner_id, address, city, monthly_rent, availability_window) VALUES

-- ── 4-way cycle properties (IDs 1-4) ────────────────────────────────────────

-- Prop 1 — Arjun in Delhi
(1,
 '14B, Vasant Vihar, New Delhi',
 'Delhi',
 45000.00,
 '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Prop 2 — Priya in Mumbai
(2,
 '7, Sea View Apartments, Bandra West, Mumbai',
 'Mumbai',
 72000.00,
 '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Prop 3 — Rohan in Kolkata
(3,
 '22, Park Street, Kolkata',
 'Kolkata',
 28000.00,
 '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Prop 4 — Divya in Bengaluru
(4,
 '301, Prestige Elgin, Koramangala, Bengaluru',
 'Bengaluru',
 55000.00,
 '[2026-05-01, 2026-06-01)'::DATERANGE),

-- ── Additional realistic listings ────────────────────────────────────────────

-- Prop 5 — Kabir in Hyderabad
(5,
 '12, Jubilee Hills Road No. 36, Hyderabad',
 'Hyderabad',
 38000.00,
 '[2026-05-15, 2026-07-15)'::DATERANGE),

-- Prop 6 — Meera in Chennai
(6,
 '45, Anna Nagar 2nd Avenue, Chennai',
 'Chennai',
 32000.00,
 '[2026-06-01, 2026-08-01)'::DATERANGE),

-- Prop 7 — Sameer in Pune
(7,
 '9, Koregaon Park Lane 5, Pune',
 'Pune',
 25000.00,
 '[2026-04-15, 2026-06-15)'::DATERANGE),

-- Prop 8 — Anita in Kolkata (second Kolkata listing)
(8,
 '5, Ballygunge Place, Kolkata',
 'Kolkata',
 31000.00,
 '[2026-05-10, 2026-07-10)'::DATERANGE),

-- Prop 9 — Rahul in Delhi (second Delhi listing)
(9,
 '88, Safdarjung Enclave, New Delhi',
 'Delhi',
 52000.00,
 '[2026-05-20, 2026-07-20)'::DATERANGE),

-- Prop 10 — FRAUD TEST: Abnormally low rent in Mumbai (₹2,000 vs. market ~₹65,000)
--           The trigger in triggers.sql will auto-flag this as fraud.
(10,
 '3, Dharavi Cross Lane, Mumbai',
 'Mumbai',
 2000.00,   -- <-- intentionally suspicious: 97% below Mumbai average
 '[2026-05-01, 2026-06-30)'::DATERANGE);

-- NOTE: Property 10's is_fraud_flagged will be automatically set to TRUE
--       by the trigger `trg_auto_flag_fraud_rent` defined in triggers.sql.
--       If running seed.sql standalone (without triggers.sql loaded first),
--       add: UPDATE Properties SET is_fraud_flagged = TRUE WHERE id = 10;


-- =============================================================================
-- 3. SWAP_REQUESTS
--    desired_window for the 4-way cycle is [2026-05-01, 2026-06-01) so it
--    perfectly overlaps the property availability windows above.
-- =============================================================================

INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window) VALUES

-- ── 4-way cycle requests ─────────────────────────────────────────────────────

-- Request 1: Arjun (Delhi) → wants Mumbai, window May 2026
(1, 1, 'Mumbai',    '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Request 2: Priya (Mumbai) → wants Kolkata, window May 2026
(2, 2, 'Kolkata',   '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Request 3: Rohan (Kolkata) → wants Bengaluru, window May 2026
(3, 3, 'Bengaluru', '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Request 4: Divya (Bengaluru) → wants Delhi, window May 2026
(4, 4, 'Delhi',     '[2026-05-01, 2026-06-01)'::DATERANGE),

-- ── Additional requests (non-cycle) ─────────────────────────────────────────

-- Request 5: Kabir (Hyderabad) → wants Chennai, Jun-Jul 2026
(5, 5, 'Chennai',   '[2026-06-01, 2026-07-15)'::DATERANGE),

-- Request 6: Meera (Chennai) → wants Hyderabad, Jun-Aug 2026
(6, 6, 'Hyderabad', '[2026-06-01, 2026-08-01)'::DATERANGE),

-- Request 7: Sameer (Pune) → wants Mumbai, May 2026
(7, 7, 'Mumbai',    '[2026-05-01, 2026-06-01)'::DATERANGE),

-- Request 8: Anita (Kolkata 2nd) → wants Delhi, May-Jul 2026
(8, 8, 'Delhi',     '[2026-05-10, 2026-07-10)'::DATERANGE),

-- Request 9: Rahul (Delhi 2nd) → wants Pune, May-Jul 2026
(9, 9, 'Pune',      '[2026-05-20, 2026-07-20)'::DATERANGE);

-- Fraud-listed property owner does not open a swap request — realistic:
-- a fraudster would either not list or the request is blocked by the app.


-- =============================================================================
-- 4. SUCCESSFUL_SWAPS  (historical record — pre-seeded for demo/reporting)
--    This represents a previously completed 3-way swap between users 5, 6, 7
--    so the reporting queries have data to aggregate.
-- =============================================================================

INSERT INTO Successful_Swaps (swap_group_id, executed_at, participant_count, status) VALUES
(
    '11111111-aaaa-4bbb-8ccc-dddddddddddd'::UUID,
    '2026-04-10 14:30:00+05:30',
    3,
    'COMPLETED'
);


-- =============================================================================
-- 5. SWAP_LOG_ENTRIES  (detail rows for the pre-seeded historical swap)
--    Kabir → Meera's property | Meera → Sameer's property | Sameer → Kabir's
-- =============================================================================

INSERT INTO Swap_Log_Entries (swap_group_id, user_id, property_id) VALUES
('11111111-aaaa-4bbb-8ccc-dddddddddddd'::UUID, 5, 6),  -- Kabir moves to prop 6
('11111111-aaaa-4bbb-8ccc-dddddddddddd'::UUID, 6, 7),  -- Meera moves to prop 7
('11111111-aaaa-4bbb-8ccc-dddddddddddd'::UUID, 7, 5);  -- Sameer moves to prop 5


-- =============================================================================
-- QUICK VERIFICATION QUERIES (comment out in production)
-- =============================================================================

/*
-- Confirm 4-way cycle setup
SELECT
    sr.id                       AS request_id,
    u.full_name                 AS requester,
    p.city                      AS current_city,
    sr.desired_city             AS wants_city,
    sr.desired_window && p.availability_window AS windows_overlap
FROM Swap_Requests sr
JOIN Users       u ON u.id = sr.user_id
JOIN Properties  p ON p.id = sr.current_property_id
WHERE sr.id BETWEEN 1 AND 4
ORDER BY sr.id;

-- Confirm fraud row was auto-flagged
SELECT id, city, monthly_rent, is_fraud_flagged
FROM Properties
WHERE id = 10;
*/

-- =============================================================================
-- END OF FILE: seed.sql
-- =============================================================================
