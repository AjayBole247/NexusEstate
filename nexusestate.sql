-- ============================================================
--   NexusEstate: AI-Driven PropTech with Multi-Node Lease Swap Engine
--   PostgreSQL Implementation  |  DBMS Project
-- ============================================================


-- ============================================================
-- SECTION 1: SCHEMA CREATION (CREATE TABLES)
-- ============================================================

-- Drop tables if they already exist (clean slate)
DROP TABLE IF EXISTS transactions   CASCADE;
DROP TABLE IF EXISTS swap_requests  CASCADE;
DROP TABLE IF EXISTS leases         CASCADE;
DROP TABLE IF EXISTS properties     CASCADE;
DROP TABLE IF EXISTS users          CASCADE;


-- 1. users
CREATE TABLE users (
    user_id   SERIAL        PRIMARY KEY,
    name      VARCHAR(100)  NOT NULL,
    email     VARCHAR(150)  NOT NULL UNIQUE
);

-- 2. properties
CREATE TABLE properties (
    property_id  SERIAL          PRIMARY KEY,
    owner_id     INT             NOT NULL,
    city         VARCHAR(100)    NOT NULL,
    price        NUMERIC(12, 2)  NOT NULL CHECK (price >= 0),
    CONSTRAINT fk_property_owner FOREIGN KEY (owner_id) REFERENCES users (user_id)
);

-- 3. leases
CREATE TABLE leases (
    lease_id     SERIAL  PRIMARY KEY,
    user_id      INT     NOT NULL,
    property_id  INT     NOT NULL,
    start_date   DATE    NOT NULL,
    end_date     DATE    NOT NULL,
    CONSTRAINT fk_lease_user     FOREIGN KEY (user_id)     REFERENCES users      (user_id),
    CONSTRAINT fk_lease_property FOREIGN KEY (property_id) REFERENCES properties (property_id),
    CONSTRAINT chk_lease_dates   CHECK (end_date > start_date)
);

-- 4. swap_requests
CREATE TABLE swap_requests (
    request_id    SERIAL        PRIMARY KEY,
    user_id       INT           NOT NULL,
    current_city  VARCHAR(100)  NOT NULL,
    desired_city  VARCHAR(100)  NOT NULL,
    CONSTRAINT fk_swap_user FOREIGN KEY (user_id) REFERENCES users (user_id)
);

-- 5. transactions
CREATE TABLE transactions (
    transaction_id  SERIAL        PRIMARY KEY,
    details         TEXT          NOT NULL,
    status          VARCHAR(20)   NOT NULL DEFAULT 'PENDING'
                    CHECK (status IN ('PENDING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'))
);


-- ============================================================
-- SECTION 2: INDEXES (PERFORMANCE)
-- ============================================================

CREATE INDEX idx_properties_city      ON properties    (city);
CREATE INDEX idx_properties_owner_id  ON properties    (owner_id);
CREATE INDEX idx_leases_user_id       ON leases        (user_id);
CREATE INDEX idx_leases_property_id   ON leases        (property_id);
CREATE INDEX idx_leases_dates         ON leases        (start_date, end_date);
CREATE INDEX idx_swap_current_city    ON swap_requests (current_city);
CREATE INDEX idx_swap_desired_city    ON swap_requests (desired_city);
CREATE INDEX idx_swap_user_id         ON swap_requests (user_id);


-- ============================================================
-- SECTION 3: TRIGGER — Prevent Negative Property Price
-- ============================================================

CREATE OR REPLACE FUNCTION fn_check_negative_price()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.price < 0 THEN
        RAISE EXCEPTION
            'Property price cannot be negative. Provided value: %', NEW.price;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_no_negative_price
BEFORE INSERT OR UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION fn_check_negative_price();


-- ============================================================
-- SECTION 4: SAMPLE DATA (INSERT)
-- ============================================================

-- users (10 rows for richer swap chains)
INSERT INTO users (name, email) VALUES
    ('Alice Sharma',   'alice@nexusestate.com'),
    ('Bob Mehta',      'bob@nexusestate.com'),
    ('Carol Iyer',     'carol@nexusestate.com'),
    ('David Rao',      'david@nexusestate.com'),
    ('Eva Nair',       'eva@nexusestate.com'),
    ('Frank D''Souza', 'frank@nexusestate.com'),
    ('Grace Pillai',   'grace@nexusestate.com'),
    ('Henry Joshi',    'henry@nexusestate.com'),
    ('Irene Kapoor',   'irene@nexusestate.com'),
    ('Jay Verma',      'jay@nexusestate.com');

-- properties
INSERT INTO properties (owner_id, city, price) VALUES
    (1, 'Mumbai',    85000.00),
    (2, 'Delhi',     92000.00),
    (3, 'Bangalore', 76000.00),
    (4, 'Chennai',   30000.00),   -- undervalued candidate
    (5, 'Hyderabad', 88000.00),
    (6, 'Mumbai',    25000.00),   -- undervalued candidate
    (7, 'Delhi',     95000.00),
    (8, 'Pune',      60000.00);

-- leases
INSERT INTO leases (user_id, property_id, start_date, end_date) VALUES
    (1, 3, '2024-01-01', '2024-12-31'),
    (2, 4, '2024-03-01', '2025-02-28'),
    (3, 1, '2024-06-01', '2025-05-31'),
    (4, 2, '2024-07-01', '2025-06-30'),
    (5, 5, '2024-09-01', '2025-08-31'),
    -- overlapping lease for property 3 (triggers overlap query)
    (6, 3, '2024-10-01', '2025-03-31');

-- swap_requests  (forms chains: Alice→Bob→Carol→Alice  and  David→Eva→David)
INSERT INTO swap_requests (user_id, current_city, desired_city) VALUES
    (1, 'Mumbai',    'Delhi'),        -- Alice  wants Delhi
    (2, 'Delhi',     'Bangalore'),    -- Bob    wants Bangalore
    (3, 'Bangalore', 'Mumbai'),       -- Carol  wants Mumbai  → closes A→B→C→A
    (4, 'Chennai',   'Hyderabad'),    -- David  wants Hyderabad
    (5, 'Hyderabad', 'Chennai'),      -- Eva    wants Chennai → closes D→E→D
    (6, 'Mumbai',    'Pune'),         -- Frank  wants Pune
    (7, 'Delhi',     'Pune'),         -- Grace  wants Pune
    (8, 'Pune',      'Mumbai');       -- Henry  wants Mumbai

-- transactions
INSERT INTO transactions (details, status) VALUES
    ('Lease swap: Alice (Mumbai) ↔ Carol (Bangalore)',         'COMPLETED'),
    ('Lease swap: Bob (Delhi) ↔ David (Chennai)',              'PENDING'),
    ('Direct purchase: Eva acquires property_id=5',            'COMPLETED'),
    ('Lease renewal: Frank extends property_id=6 by 12 months','FAILED'),
    ('Lease swap: Grace (Delhi) ↔ Henry (Pune)',               'PENDING');


-- ============================================================
-- SECTION 5: SQL QUERIES
-- ============================================================

-- ── 5A. RECURSIVE QUERY: Detect Multi-User Swap Chains ─────────────────────
--
--   Finds circular swap chains of any length (e.g. A→B→C→A).
--   Strategy: start from each user, follow desired_city → current_city
--   links, and stop when we return to the origin city.
-- ────────────────────────────────────────────────────────────────────────────
WITH RECURSIVE swap_chain AS (

    -- Base case: each swap request is the start of its own chain
    SELECT
        sr.user_id                        AS origin_user_id,
        sr.current_city                   AS origin_city,
        sr.desired_city                   AS next_city,
        ARRAY[sr.user_id]                 AS visited_users,
        CAST(sr.user_id AS TEXT)
            || ' (' || sr.current_city || ')'
                                          AS chain_path,
        1                                 AS depth
    FROM swap_requests sr

    UNION ALL

    -- Recursive step: follow the chain to the next matching node
    SELECT
        sc.origin_user_id,
        sc.origin_city,
        sr.desired_city                   AS next_city,
        sc.visited_users || sr.user_id    AS visited_users,
        sc.chain_path
            || ' → ' || sr.user_id
            || ' (' || sr.current_city || ')'
                                          AS chain_path,
        sc.depth + 1                      AS depth
    FROM swap_chain    sc
    JOIN swap_requests sr
        ON  sr.current_city  = sc.next_city      -- connect the chain
        AND sr.user_id      <> ALL(sc.visited_users)  -- no revisit
        AND sc.depth         < 10                -- guard against runaway recursion
)

-- Keep only chains that complete a full cycle back to the origin city
SELECT
    chain_path
        || ' → BACK TO (' || origin_city || ')'  AS full_cycle,
    depth                                         AS chain_length,
    cardinality(visited_users)                    AS users_involved
FROM swap_chain
WHERE next_city = origin_city      -- cycle closes
ORDER BY chain_length, full_cycle;


-- ── 5B. Detect Undervalued Properties (price < 50 % of city average) ───────
SELECT
    p.property_id,
    p.city,
    p.price                                         AS property_price,
    ROUND(AVG(p2.price), 2)                         AS city_avg_price,
    ROUND(p.price / AVG(p2.price) * 100, 1)        AS pct_of_avg,
    u.name                                          AS owner_name
FROM properties p
JOIN properties p2 ON p2.city = p.city        -- self-join for city average
JOIN users      u  ON u.user_id = p.owner_id
GROUP BY p.property_id, p.city, p.price, u.name
HAVING p.price < 0.5 * AVG(p2.price)
ORDER BY pct_of_avg;


-- ── 5C. Detect Overlapping Leases on the Same Property ─────────────────────
SELECT
    a.property_id,
    pr.city,
    a.lease_id   AS lease_a,
    a.user_id    AS user_a,
    a.start_date AS start_a,
    a.end_date   AS end_a,
    b.lease_id   AS lease_b,
    b.user_id    AS user_b,
    b.start_date AS start_b,
    b.end_date   AS end_b
FROM leases      a
JOIN leases      b  ON  a.property_id = b.property_id
                    AND a.lease_id    < b.lease_id          -- avoid duplicates
                    AND a.start_date  < b.end_date          -- overlap condition
                    AND a.end_date    > b.start_date
JOIN properties  pr ON pr.property_id = a.property_id
ORDER BY a.property_id, a.lease_id;


-- ============================================================
-- SECTION 6: TRANSACTION — Safe Multi-User Lease Swap
-- ============================================================
--
--   Simulates Alice (user_id=1) and Carol (user_id=3) swapping
--   their leases (lease_id=1 and lease_id=3) safely using
--   SELECT ... FOR UPDATE to prevent concurrent conflicts.
-- ────────────────────────────────────────────────────────────

BEGIN;

    -- Step 1: Log the intent
    INSERT INTO transactions (details, status)
    VALUES ('Lease swap attempt: Alice (lease 1) ↔ Carol (lease 3)', 'PENDING');

    -- Step 2: Lock both lease rows to prevent concurrent modification
    SELECT lease_id, user_id, property_id, start_date, end_date
    FROM   leases
    WHERE  lease_id IN (1, 3)
    FOR UPDATE;

    -- Step 3: Perform the swap
    --   Alice (user 1) takes over Carol's property (property 1)
    UPDATE leases
    SET    user_id = 1
    WHERE  lease_id = 3;

    --   Carol (user 3) takes over Alice's property (property 3)
    UPDATE leases
    SET    user_id = 3
    WHERE  lease_id = 1;

    -- Step 4: Mark the transaction as completed
    UPDATE transactions
    SET    status = 'COMPLETED'
    WHERE  details = 'Lease swap attempt: Alice (lease 1) ↔ Carol (lease 3)';

COMMIT;


-- ── Rollback demo (run independently to test failure path) ─────────────────
BEGIN;

    INSERT INTO transactions (details, status)
    VALUES ('Test rollback: invalid swap simulation', 'PENDING');

    -- Intentional bad update (non-existent lease)
    UPDATE leases
    SET    user_id = 999           -- no such user → FK violation
    WHERE  lease_id = 1;

    -- If we reach here, mark failed; otherwise the ROLLBACK below fires
    UPDATE transactions
    SET    status = 'FAILED'
    WHERE  details = 'Test rollback: invalid swap simulation';

ROLLBACK;


-- ============================================================
-- SECTION 7: TRIGGER TEST — Negative Price Guard
-- ============================================================

-- This insert should be BLOCKED by the trigger (price = -5000)
-- Uncomment to verify:
/*
INSERT INTO properties (owner_id, city, price)
VALUES (1, 'Kolkata', -5000.00);
-- Expected: ERROR:  Property price cannot be negative. Provided value: -5000
*/

-- This insert should SUCCEED (price = 0 is allowed)
INSERT INTO properties (owner_id, city, price)
VALUES (1, 'Kolkata', 0.00);


-- ============================================================
-- SECTION 8: VERIFICATION SELECTS (optional / for pgAdmin)
-- ============================================================

SELECT * FROM users;
SELECT * FROM properties ORDER BY property_id;
SELECT * FROM leases ORDER BY lease_id;
SELECT * FROM swap_requests ORDER BY request_id;
SELECT * FROM transactions ORDER BY transaction_id;
