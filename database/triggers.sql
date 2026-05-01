-- =============================================================================
-- FILE: backend/database/triggers.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: Trigger functions and trigger definitions.
--
--   TRIGGER 1  — trg_auto_flag_fraud_rent
--                Fires BEFORE INSERT OR UPDATE on Properties.
--                Auto-sets is_fraud_flagged = TRUE when monthly_rent falls
--                below ₹5,000 in any major Indian metro city.
--
--   TRIGGER 2  — trg_prevent_fraud_swap
--                Fires BEFORE INSERT on Swap_Requests.
--                Blocks a new swap request if the current_property_id is
--                already fraud-flagged, giving an actionable error.
--
--   TRIGGER 3  — trg_log_fraud_flag_change
--                Fires AFTER UPDATE on Properties when is_fraud_flagged
--                changes value. Writes an audit entry to Fraud_Audit_Log.
--
--   BONUS TABLE — Fraud_Audit_Log
--                Lightweight append-only log of all fraud flag changes.
-- =============================================================================


-- =============================================================================
-- BONUS: Fraud_Audit_Log
-- -----------------------------------------------------------------------------
-- Append-only. Written to by trigger 3. Never updated or deleted.
-- =============================================================================

CREATE TABLE IF NOT EXISTS Fraud_Audit_Log (
    id              BIGSERIAL       PRIMARY KEY,
    property_id     INT             NOT NULL
                                    REFERENCES Properties(id)
                                    ON DELETE SET NULL,
    old_flag        BOOLEAN,
    new_flag        BOOLEAN         NOT NULL,
    old_rent        DECIMAL(12,2),
    new_rent        DECIMAL(12,2)   NOT NULL,
    flagged_by      TEXT            NOT NULL DEFAULT 'SYSTEM_TRIGGER',
    flagged_at      TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    note            TEXT
);

CREATE INDEX IF NOT EXISTS idx_fraud_audit_property
    ON Fraud_Audit_Log USING BTREE (property_id, flagged_at DESC);

COMMENT ON TABLE Fraud_Audit_Log IS
    'Append-only audit log. Written by trg_log_fraud_flag_change whenever '
    'is_fraud_flagged changes on Properties.';


-- =============================================================================
-- TRIGGER 1: Auto-flag fraud on low rent
-- =============================================================================

-- ── Major cities configuration ───────────────────────────────────────────────
-- Stored as a simple lookup table so the ops team can update the threshold
-- without a code deployment.

CREATE TABLE IF NOT EXISTS Fraud_City_Thresholds (
    city                VARCHAR(100)    PRIMARY KEY,
    min_rent_threshold  DECIMAL(12,2)   NOT NULL,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

INSERT INTO Fraud_City_Thresholds (city, min_rent_threshold) VALUES
    ('Mumbai',    5000.00),
    ('Delhi',     5000.00),
    ('Bengaluru', 5000.00),
    ('Kolkata',   5000.00),
    ('Hyderabad', 5000.00),
    ('Chennai',   5000.00),
    ('Pune',      5000.00),
    ('Ahmedabad', 5000.00),
    ('Jaipur',    5000.00),
    ('Surat',     5000.00)
ON CONFLICT (city) DO NOTHING;

COMMENT ON TABLE Fraud_City_Thresholds IS
    'Configurable per-city minimum rent thresholds for fraud auto-flagging. '
    'Update rows here to change thresholds without touching trigger code.';


-- ── Trigger function ─────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION fn_auto_flag_fraud_rent()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
DECLARE
    v_threshold     DECIMAL(12,2);
    v_city_upper    VARCHAR(100);
BEGIN
    -- Normalise city to title-case for case-insensitive lookup
    -- e.g. 'mumbai', 'MUMBAI' all resolve to 'Mumbai'
    v_city_upper := INITCAP(TRIM(NEW.city));

    -- Look up the threshold for this city
    SELECT min_rent_threshold
    INTO   v_threshold
    FROM   Fraud_City_Thresholds
    WHERE  city = v_city_upper;

    IF FOUND THEN
        -- City is in the major cities list — apply threshold rule
        IF NEW.monthly_rent < v_threshold THEN
            NEW.is_fraud_flagged := TRUE;

            RAISE WARNING
                'NexusEstate Fraud Alert: Property % in % has rent ₹% which is '
                'below the ₹% threshold. Auto-flagged.',
                COALESCE(NEW.id::TEXT, '[new]'),
                v_city_upper,
                NEW.monthly_rent,
                v_threshold;
        ELSE
            -- Rent is acceptable; only clear the flag if this is an UPDATE
            -- that pushed rent back above the threshold (manual correction).
            IF TG_OP = 'UPDATE' AND OLD.monthly_rent < v_threshold THEN
                NEW.is_fraud_flagged := FALSE;
                RAISE NOTICE
                    'NexusEstate: Property % rent raised above threshold — '
                    'fraud flag cleared.', NEW.id;
            END IF;
            -- On INSERT with valid rent, leave is_fraud_flagged as supplied
            -- (defaults to FALSE per schema).
        END IF;
    ELSE
        -- City is NOT in the major-cities list — no auto-flagging.
        -- The application / admin can still manually flag later.
        NULL;
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_auto_flag_fraud_rent IS
    'BEFORE INSERT OR UPDATE trigger function. Compares monthly_rent against '
    'Fraud_City_Thresholds and sets is_fraud_flagged = TRUE when rent falls '
    'below the city threshold. On UPDATE, clears the flag if rent is corrected '
    'above the threshold.';

-- Create / replace the trigger on Properties
DROP TRIGGER IF EXISTS trg_auto_flag_fraud_rent ON Properties;

CREATE TRIGGER trg_auto_flag_fraud_rent
    BEFORE INSERT OR UPDATE OF monthly_rent, city, is_fraud_flagged
    ON Properties
    FOR EACH ROW
    EXECUTE FUNCTION fn_auto_flag_fraud_rent();

COMMENT ON TRIGGER trg_auto_flag_fraud_rent ON Properties IS
    'Fires on INSERT or any UPDATE that changes monthly_rent, city, or '
    'is_fraud_flagged. Delegates to fn_auto_flag_fraud_rent().';


-- =============================================================================
-- TRIGGER 2: Block swap requests on fraud-flagged properties
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_prevent_fraud_swap()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
DECLARE
    v_is_flagged    BOOLEAN;
    v_city          VARCHAR(100);
    v_rent          DECIMAL(12,2);
BEGIN
    SELECT is_fraud_flagged, city, monthly_rent
    INTO   v_is_flagged, v_city, v_rent
    FROM   Properties
    WHERE  id = NEW.current_property_id;

    IF v_is_flagged THEN
        RAISE EXCEPTION
            'Swap request blocked: Property % (%, ₹%) is fraud-flagged. '
            'Contact support to resolve the listing before opening a swap.',
            NEW.current_property_id,
            v_city,
            v_rent
            USING ERRCODE = 'check_violation';
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_prevent_fraud_swap IS
    'BEFORE INSERT trigger function on Swap_Requests. Raises check_violation '
    'if the current_property_id belongs to a fraud-flagged listing.';

DROP TRIGGER IF EXISTS trg_prevent_fraud_swap ON Swap_Requests;

CREATE TRIGGER trg_prevent_fraud_swap
    BEFORE INSERT
    ON Swap_Requests
    FOR EACH ROW
    EXECUTE FUNCTION fn_prevent_fraud_swap();

COMMENT ON TRIGGER trg_prevent_fraud_swap ON Swap_Requests IS
    'Blocks new swap requests against fraud-flagged properties.';


-- =============================================================================
-- TRIGGER 3: Audit log for fraud flag changes
-- =============================================================================

CREATE OR REPLACE FUNCTION fn_log_fraud_flag_change()
RETURNS TRIGGER
LANGUAGE plpgsql AS
$$
BEGIN
    -- Only write a log row when the flag actually flips
    IF (OLD.is_fraud_flagged IS DISTINCT FROM NEW.is_fraud_flagged) OR
       (TG_OP = 'INSERT' AND NEW.is_fraud_flagged = TRUE) THEN

        INSERT INTO Fraud_Audit_Log
            (property_id, old_flag, new_flag, old_rent, new_rent, note)
        VALUES (
            NEW.id,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.is_fraud_flagged END,
            NEW.is_fraud_flagged,
            CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.monthly_rent END,
            NEW.monthly_rent,
            CASE
                WHEN TG_OP = 'INSERT' AND NEW.is_fraud_flagged
                    THEN 'Auto-flagged on INSERT by rent threshold trigger.'
                WHEN TG_OP = 'UPDATE' AND NEW.is_fraud_flagged
                    THEN 'Flag set TRUE on UPDATE (rent: ₹' || NEW.monthly_rent || ').'
                ELSE
                    'Flag cleared — rent raised to ₹' || NEW.monthly_rent || '.'
            END
        );
    END IF;

    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION fn_log_fraud_flag_change IS
    'AFTER INSERT OR UPDATE trigger function on Properties. Writes to '
    'Fraud_Audit_Log whenever is_fraud_flagged changes value.';

DROP TRIGGER IF EXISTS trg_log_fraud_flag_change ON Properties;

CREATE TRIGGER trg_log_fraud_flag_change
    AFTER INSERT OR UPDATE OF is_fraud_flagged
    ON Properties
    FOR EACH ROW
    EXECUTE FUNCTION fn_log_fraud_flag_change();

COMMENT ON TRIGGER trg_log_fraud_flag_change ON Properties IS
    'Writes an audit row to Fraud_Audit_Log whenever is_fraud_flagged changes.';


-- =============================================================================
-- SMOKE TESTS (run manually to verify all triggers fire correctly)
-- =============================================================================

/*
-- TEST A: Trigger 1 — INSERT below threshold should auto-flag
INSERT INTO Properties (owner_id, address, city, monthly_rent, availability_window)
VALUES (1, 'Test Lane 1, Mumbai', 'Mumbai', 1500.00, '[2026-06-01, 2026-07-01)');
-- Expected: is_fraud_flagged = TRUE, WARNING raised.
SELECT id, city, monthly_rent, is_fraud_flagged FROM Properties ORDER BY id DESC LIMIT 1;

-- TEST B: Trigger 1 — UPDATE rent above threshold should clear flag
UPDATE Properties SET monthly_rent = 20000.00 WHERE id = (SELECT MAX(id) FROM Properties);
-- Expected: is_fraud_flagged = FALSE, NOTICE raised.
SELECT id, city, monthly_rent, is_fraud_flagged FROM Properties ORDER BY id DESC LIMIT 1;

-- TEST C: Trigger 2 — Swap request against fraud-flagged property should fail
--         Property 10 (seed.sql) is fraud-flagged (₹2,000 Mumbai).
INSERT INTO Swap_Requests (user_id, current_property_id, desired_city, desired_window)
VALUES (10, 10, 'Delhi', '[2026-06-01, 2026-07-01)');
-- Expected: ERROR check_violation — "Swap request blocked: Property 10..."

-- TEST D: Trigger 3 — Fraud_Audit_Log should have entries for property 10
SELECT * FROM Fraud_Audit_Log WHERE property_id = 10 ORDER BY flagged_at;

-- TEST E: City NOT in threshold list (e.g. Shimla) — no auto-flagging
INSERT INTO Properties (owner_id, address, city, monthly_rent, availability_window)
VALUES (1, 'Mall Road, Shimla', 'Shimla', 800.00, '[2026-07-01, 2026-08-01)');
-- Expected: is_fraud_flagged remains FALSE (Shimla not in threshold table).
SELECT id, city, monthly_rent, is_fraud_flagged FROM Properties ORDER BY id DESC LIMIT 1;
*/

-- =============================================================================
-- END OF FILE: triggers.sql
-- =============================================================================
