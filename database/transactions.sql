-- =============================================================================
-- FILE: backend/database/transactions.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: ACID-safe transaction scripts for executing multi-party swaps.
--
--   SECTION 1 — Helper stored procedure: execute_swap_group()
--   SECTION 2 — Mock 3-way swap script (inline BEGIN/COMMIT) for QA
--   SECTION 3 — Mock 4-way swap script using the stored procedure
--
-- DESIGN PRINCIPLES
--   • SELECT … FOR UPDATE  — pessimistic row-level locks prevent concurrent
--     modifications to the same properties / requests during the swap window.
--   • Single transaction per swap group — all owner_id updates and request
--     deactivations succeed together or all roll back. No partial swaps.
--   • NOWAIT on the FOR UPDATE locks — fail fast rather than deadlock wait.
--     The application layer should catch the LockNotAvailable error (55P03)
--     and retry with exponential backoff.
--   • Savepoints — used inside the procedure to allow internal retries while
--     keeping the outer transaction alive.
-- =============================================================================


-- =============================================================================
-- SECTION 1: STORED PROCEDURE — execute_swap_group()
-- -----------------------------------------------------------------------------
-- Executes a swap for an arbitrary list of (user_id, from_property_id,
-- to_property_id) tuples. Call this from application code rather than
-- writing raw SQL per swap.
--
-- p_assignments: JSONB array of objects, each:
--   { "user_id": N, "from_property_id": N, "to_property_id": N }
--
-- Returns the new swap_group_id UUID.
-- =============================================================================

CREATE OR REPLACE PROCEDURE execute_swap_group(
    p_assignments JSONB,         -- array of swap assignment objects
    OUT p_swap_group_id UUID     -- the new Successful_Swaps.swap_group_id
)
LANGUAGE plpgsql AS
$$
DECLARE
    v_assignment        JSONB;
    v_user_id           INT;
    v_from_prop_id      INT;
    v_to_prop_id        INT;
    v_participant_count INT;
    v_locked_prop_ids   INT[];

    -- Cursor variables for validation
    v_from_rent         DECIMAL;
    v_to_rent           DECIMAL;
    v_from_fraud        BOOLEAN;
    v_to_fraud          BOOLEAN;
BEGIN
    -- ── 0. Basic argument validation ─────────────────────────────────────────
    v_participant_count := jsonb_array_length(p_assignments);

    IF v_participant_count NOT BETWEEN 2 AND 4 THEN
        RAISE EXCEPTION
            'Swap group must have 2–4 participants, got %.', v_participant_count
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    -- Generate swap group UUID
    p_swap_group_id := uuid_generate_v4();

    -- ── 1. Acquire pessimistic row locks on ALL properties in one shot ───────
    --       Ordering by property_id prevents deadlocks when two concurrent
    --       transactions try to lock overlapping property sets.
    SELECT ARRAY_AGG(prop_id ORDER BY prop_id)
    INTO   v_locked_prop_ids
    FROM (
        SELECT DISTINCT
            (elem->>'from_property_id')::INT AS prop_id
        FROM jsonb_array_elements(p_assignments) AS elem
        UNION
        SELECT DISTINCT
            (elem->>'to_property_id')::INT
        FROM jsonb_array_elements(p_assignments) AS elem
    ) all_ids;

    -- Lock all involved properties in a single ordered scan
    PERFORM id
    FROM    Properties
    WHERE   id = ANY(v_locked_prop_ids)
    ORDER BY id
    FOR UPDATE NOWAIT;

    -- ── 2. Lock all matching Swap_Requests ───────────────────────────────────
    PERFORM sr.id
    FROM    Swap_Requests sr
    WHERE   sr.current_property_id = ANY(v_locked_prop_ids)
      AND   sr.is_active = TRUE
    ORDER BY sr.id
    FOR UPDATE NOWAIT;

    -- ── 3. Validate each assignment (fraud check, ownership check) ───────────
    FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        v_user_id      := (v_assignment->>'user_id')::INT;
        v_from_prop_id := (v_assignment->>'from_property_id')::INT;
        v_to_prop_id   := (v_assignment->>'to_property_id')::INT;

        -- Verify "from" property is owned by this user
        IF NOT EXISTS (
            SELECT 1 FROM Properties
            WHERE id = v_from_prop_id AND owner_id = v_user_id
        ) THEN
            RAISE EXCEPTION
                'User % does not own property %.', v_user_id, v_from_prop_id
                USING ERRCODE = 'foreign_key_violation';
        END IF;

        -- Verify neither property is fraud-flagged
        SELECT is_fraud_flagged INTO v_from_fraud
        FROM Properties WHERE id = v_from_prop_id;

        SELECT is_fraud_flagged INTO v_to_fraud
        FROM Properties WHERE id = v_to_prop_id;

        IF v_from_fraud OR v_to_fraud THEN
            RAISE EXCEPTION
                'Swap aborted: property % or % is fraud-flagged.',
                v_from_prop_id, v_to_prop_id
                USING ERRCODE = 'check_violation';
        END IF;
    END LOOP;

    -- ── 4. Write header record ───────────────────────────────────────────────
    INSERT INTO Successful_Swaps (swap_group_id, participant_count, status)
    VALUES (p_swap_group_id, v_participant_count, 'PENDING');

    -- ── 5. Execute ownership transfers ───────────────────────────────────────
    FOR v_assignment IN SELECT * FROM jsonb_array_elements(p_assignments)
    LOOP
        v_user_id      := (v_assignment->>'user_id')::INT;
        v_from_prop_id := (v_assignment->>'from_property_id')::INT;
        v_to_prop_id   := (v_assignment->>'to_property_id')::INT;

        -- Transfer ownership: user receives the "to" property
        UPDATE Properties
        SET    owner_id   = v_user_id,
               updated_at = NOW()
        WHERE  id         = v_to_prop_id;

        -- Write log entry
        INSERT INTO Swap_Log_Entries (swap_group_id, user_id, property_id)
        VALUES (p_swap_group_id, v_user_id, v_to_prop_id);
    END LOOP;

    -- ── 6. Deactivate all matching Swap_Requests ─────────────────────────────
    UPDATE Swap_Requests
    SET    is_active   = FALSE,
           updated_at  = NOW()
    WHERE  current_property_id = ANY(v_locked_prop_ids)
      AND  is_active            = TRUE;

    -- ── 7. Mark swap as COMPLETED ────────────────────────────────────────────
    UPDATE Successful_Swaps
    SET    status      = 'COMPLETED',
           executed_at = NOW()
    WHERE  swap_group_id = p_swap_group_id;

    RAISE NOTICE 'Swap group % committed successfully (% participants).',
        p_swap_group_id, v_participant_count;

EXCEPTION
    WHEN lock_not_available THEN
        RAISE EXCEPTION
            'Could not acquire locks for swap group. Retry later. (ERRCODE 55P03)'
            USING ERRCODE = 'lock_not_available';
    WHEN OTHERS THEN
        -- Mark header as rolled back if it was already inserted
        BEGIN
            UPDATE Successful_Swaps
            SET    status = 'ROLLED_BACK'
            WHERE  swap_group_id = p_swap_group_id;
        EXCEPTION WHEN OTHERS THEN NULL; END;
        RAISE; -- re-raise original error
END;
$$;

COMMENT ON PROCEDURE execute_swap_group IS
    'Atomically executes a 2–4 way property swap. Acquires row-level locks, '
    'validates ownership and fraud status, transfers owner_id, deactivates '
    'Swap_Requests, and writes audit log. NOWAIT locking — caller must handle '
    'lock_not_available (55P03) with retry.';


-- =============================================================================
-- SECTION 2: MOCK 3-WAY SWAP — Inline BEGIN / COMMIT script
-- -----------------------------------------------------------------------------
-- Scenario (using seed.sql data):
--   User 5 (Kabir,  prop 5, Hyderabad) → receives prop 6
--   User 6 (Meera,  prop 6, Chennai)   → receives prop 7
--   User 7 (Sameer, prop 7, Pune)      → receives prop 5
--
-- Run this block manually in psql or a migration tool for QA.
-- =============================================================================

DO $$
DECLARE
    v_prop5_owner   INT;
    v_prop6_owner   INT;
    v_prop7_owner   INT;
    v_req_ids       INT[];
    v_swap_group_id UUID := uuid_generate_v4();
BEGIN

    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE '  NexusEstate — 3-Way Swap Transaction';
    RAISE NOTICE '  Swap Group: %', v_swap_group_id;
    RAISE NOTICE '══════════════════════════════════════════════════════';

    -- ── STEP 1: Lock target rows (properties first, then requests) ───────────
    --            Always lock in ascending ID order to prevent deadlocks.

    RAISE NOTICE '[1/7] Acquiring pessimistic locks on properties 5, 6, 7...';

    SELECT id, owner_id
    INTO   STRICT v_prop5_owner  -- just capturing owner for validation below
    FROM   Properties
    WHERE  id = 5
    FOR UPDATE NOWAIT;

    SELECT owner_id INTO STRICT v_prop5_owner FROM Properties WHERE id = 5;

    PERFORM id FROM Properties WHERE id IN (5, 6, 7) ORDER BY id FOR UPDATE NOWAIT;

    RAISE NOTICE '[1/7] Locks acquired on properties 5, 6, 7.';

    -- Lock the active swap requests for these properties
    SELECT ARRAY_AGG(id) INTO v_req_ids
    FROM   Swap_Requests
    WHERE  current_property_id IN (5, 6, 7)
      AND  is_active = TRUE
    ORDER BY id
    FOR UPDATE NOWAIT;

    RAISE NOTICE '[1/7] Locks acquired on swap requests: %', v_req_ids;

    -- ── STEP 2: Validate ownership ───────────────────────────────────────────
    RAISE NOTICE '[2/7] Validating property ownership...';

    SELECT owner_id INTO v_prop5_owner FROM Properties WHERE id = 5;
    SELECT owner_id INTO v_prop6_owner FROM Properties WHERE id = 6;
    SELECT owner_id INTO v_prop7_owner FROM Properties WHERE id = 7;

    IF v_prop5_owner <> 5 THEN
        RAISE EXCEPTION 'Expected user 5 to own property 5, got user %.', v_prop5_owner;
    END IF;
    IF v_prop6_owner <> 6 THEN
        RAISE EXCEPTION 'Expected user 6 to own property 6, got user %.', v_prop6_owner;
    END IF;
    IF v_prop7_owner <> 7 THEN
        RAISE EXCEPTION 'Expected user 7 to own property 7, got user %.', v_prop7_owner;
    END IF;

    RAISE NOTICE '[2/7] Ownership validated. ✓';

    -- ── STEP 3: Fraud check ──────────────────────────────────────────────────
    RAISE NOTICE '[3/7] Checking fraud flags...';

    IF EXISTS (
        SELECT 1 FROM Properties
        WHERE  id IN (5, 6, 7) AND is_fraud_flagged = TRUE
    ) THEN
        RAISE EXCEPTION 'Swap aborted: one or more properties are fraud-flagged.';
    END IF;

    RAISE NOTICE '[3/7] No fraud flags detected. ✓';

    -- ── STEP 4: Insert header ────────────────────────────────────────────────
    RAISE NOTICE '[4/7] Inserting Successful_Swaps header...';

    INSERT INTO Successful_Swaps (swap_group_id, participant_count, status)
    VALUES (v_swap_group_id, 3, 'PENDING');

    -- ── STEP 5: Transfer ownership (the core swap) ───────────────────────────
    RAISE NOTICE '[5/7] Transferring ownership...';

    -- User 5 (Kabir)  receives property 6 (was Meera's)
    UPDATE Properties
    SET    owner_id = 5, updated_at = NOW()
    WHERE  id       = 6;

    -- User 6 (Meera)  receives property 7 (was Sameer's)
    UPDATE Properties
    SET    owner_id = 6, updated_at = NOW()
    WHERE  id       = 7;

    -- User 7 (Sameer) receives property 5 (was Kabir's)
    UPDATE Properties
    SET    owner_id = 7, updated_at = NOW()
    WHERE  id       = 5;

    RAISE NOTICE '[5/7] Ownership transferred. ✓';

    -- ── STEP 6: Write audit log ──────────────────────────────────────────────
    RAISE NOTICE '[6/7] Writing Swap_Log_Entries...';

    INSERT INTO Swap_Log_Entries (swap_group_id, user_id, property_id) VALUES
        (v_swap_group_id, 5, 6),
        (v_swap_group_id, 6, 7),
        (v_swap_group_id, 7, 5);

    -- ── STEP 7: Deactivate swap requests ────────────────────────────────────
    RAISE NOTICE '[7/7] Deactivating swap requests...';

    UPDATE Swap_Requests
    SET    is_active  = FALSE,
           updated_at = NOW()
    WHERE  current_property_id IN (5, 6, 7)
      AND  is_active = TRUE;

    -- Mark swap as completed
    UPDATE Successful_Swaps
    SET    status      = 'COMPLETED',
           executed_at = NOW()
    WHERE  swap_group_id = v_swap_group_id;

    RAISE NOTICE '══════════════════════════════════════════════════════';
    RAISE NOTICE '  3-Way Swap COMMITTED successfully.';
    RAISE NOTICE '  Swap Group ID: %', v_swap_group_id;
    RAISE NOTICE '══════════════════════════════════════════════════════';

EXCEPTION
    WHEN lock_not_available THEN
        RAISE EXCEPTION '3-Way swap ROLLED BACK — lock contention. Retry. (55P03)';
    WHEN OTHERS THEN
        RAISE EXCEPTION '3-Way swap ROLLED BACK — %', SQLERRM;
END;
$$;


-- =============================================================================
-- SECTION 3: MOCK 4-WAY SWAP — via stored procedure (seed.sql cycle)
-- -----------------------------------------------------------------------------
-- Executes the seeded 4-way cycle:
--   Arjun  (user 1, prop 1, Delhi)     → receives prop 2 (Mumbai)
--   Priya  (user 2, prop 2, Mumbai)    → receives prop 3 (Kolkata)
--   Rohan  (user 3, prop 3, Kolkata)   → receives prop 4 (Bengaluru)
--   Divya  (user 4, prop 4, Bengaluru) → receives prop 1 (Delhi)
--
-- Wrapped in an explicit transaction to show BEGIN / COMMIT flow.
-- =============================================================================

BEGIN;

    DECLARE
        v_group_id UUID;
    BEGIN
        CALL execute_swap_group(
            '[
                {"user_id": 1, "from_property_id": 1, "to_property_id": 2},
                {"user_id": 2, "from_property_id": 2, "to_property_id": 3},
                {"user_id": 3, "from_property_id": 3, "to_property_id": 4},
                {"user_id": 4, "from_property_id": 4, "to_property_id": 1}
            ]'::JSONB,
            v_group_id
        );

        RAISE NOTICE '4-Way swap committed. Group ID: %', v_group_id;
    END;

COMMIT;


-- =============================================================================
-- SECTION 4: POST-TRANSACTION VERIFICATION QUERIES
-- =============================================================================

/*  Run these after the transactions to confirm correctness.

    -- Ownership after 4-way swap: each user should hold their new property
    SELECT p.id AS prop_id, p.city, p.owner_id, u.full_name AS new_owner
    FROM   Properties p
    JOIN   Users      u ON u.id = p.owner_id
    WHERE  p.id BETWEEN 1 AND 4
    ORDER BY p.id;

    -- Swap requests 1-4 should all be is_active = FALSE
    SELECT id, current_property_id, desired_city, is_active
    FROM   Swap_Requests
    WHERE  id BETWEEN 1 AND 4;

    -- Successful_Swaps should contain the new 4-way record as COMPLETED
    SELECT swap_group_id, participant_count, status, executed_at
    FROM   Successful_Swaps
    ORDER BY executed_at DESC
    LIMIT  5;

    -- Log entries for the 4-way swap
    SELECT sle.swap_group_id, u.full_name, p.city
    FROM   Swap_Log_Entries sle
    JOIN   Users            u ON u.id = sle.user_id
    JOIN   Properties       p ON p.id = sle.property_id
    ORDER BY sle.swap_group_id, sle.id;
*/

-- =============================================================================
-- END OF FILE: transactions.sql
-- =============================================================================
