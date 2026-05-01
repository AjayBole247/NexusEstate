-- =============================================================================
-- FILE: backend/database/queries.sql
-- PROJECT: NexusEstate — PropTech Lease Swap Engine
-- DESCRIPTION: Analytical queries powering the swap-matching engine and
--              the fraud detection pipeline.
--
--   QUERY 1  — WITH RECURSIVE swap loop finder (3-way and 4-way cycles)
--   QUERY 2  — City-level fraud detection (rent ≥ 80% below city average)
--   QUERY 3  — Diagnostic: all active requests with overlap check
--   QUERY 4  — Swap history summary per city
-- =============================================================================


-- =============================================================================
-- QUERY 1: RECURSIVE SWAP LOOP FINDER
-- -----------------------------------------------------------------------------
-- Finds closed cycles of 3 or 4 hops among active swap requests where:
--   (a) Each hop's "desired_city" matches the next node's "current_city".
--   (b) The desired_window of the incoming request overlaps (&&) the
--       availability_window of the target property.
--   (c) The cycle closes back to the first property (start_property_id).
--
-- ALGORITHM
--   Base case  : every active request is a potential chain of length 1.
--   Recursive  : extend the chain by appending the next matching node.
--   Termination: stop at depth 4 (MAX_CYCLE_LEN) or when cycle closes.
--   Dedup      : use a visited_ids TEXT array to prevent revisiting nodes,
--                and enforce start_id < current_id to avoid mirrored
--                duplicates in the result set.
--
-- OUTPUT: One row per distinct cycle containing the ordered path.
-- =============================================================================

WITH RECURSIVE

-- ── STEP 0: Materialise active requests with their property city ─────────────
active_requests AS MATERIALIZED (
    SELECT
        sr.id                                       AS request_id,
        sr.user_id,
        sr.current_property_id                      AS property_id,
        p.city                                      AS current_city,
        p.availability_window,
        p.monthly_rent,
        sr.desired_city,
        sr.desired_window
    FROM  Swap_Requests sr
    JOIN  Properties    p  ON p.id = sr.current_property_id
    WHERE sr.is_active     = TRUE
      AND p.is_fraud_flagged = FALSE   -- never route through fraud-flagged props
),

-- ── STEP 1: Recursive chain builder ─────────────────────────────────────────
swap_chain (
    chain_len,           -- current depth of the chain (1 = just started)
    start_request_id,    -- the very first node (used to detect cycle closure)
    start_property_id,   -- the property ID of the first node
    start_city,          -- city of first node (tail of the cycle must match)
    current_request_id,  -- the last node appended in this iteration
    current_city,        -- city we are currently at (needed for next join)
    current_window,      -- availability_window of the current prop (for overlap)
    path_ids,            -- TEXT encoding of request IDs visited (for dedup)
    path_display         -- human-readable chain for debugging
) AS (

    -- ── Base case: seed with every active request ────────────────────────────
    SELECT
        1                                           AS chain_len,
        ar.request_id                               AS start_request_id,
        ar.property_id                              AS start_property_id,
        ar.current_city                             AS start_city,
        ar.request_id                               AS current_request_id,
        ar.desired_city                             AS current_city,       -- "where we want to go"
        ar.desired_window                           AS current_window,     -- window required at destination
        ar.request_id::TEXT                         AS path_ids,
        ar.current_city || ' → ' || ar.desired_city AS path_display
    FROM active_requests ar

    UNION ALL

    -- ── Recursive case: extend chain by one hop ──────────────────────────────
    SELECT
        sc.chain_len + 1,
        sc.start_request_id,
        sc.start_property_id,
        sc.start_city,
        next_node.request_id,
        next_node.desired_city,
        next_node.desired_window,
        -- Append next node's request_id to path string
        sc.path_ids || ',' || next_node.request_id::TEXT,
        sc.path_display || ' → ' || next_node.desired_city
    FROM swap_chain           sc
    JOIN active_requests      next_node
      ON  next_node.current_city    = sc.current_city
      -- Critical: the next property's window must overlap the arriving window
      AND next_node.availability_window && sc.current_window
      -- Do not revisit nodes already in the chain
      AND sc.path_ids NOT LIKE ('%' || next_node.request_id::TEXT || '%')
      -- Do not go back to the starting node mid-chain
      AND next_node.request_id <> sc.start_request_id
    WHERE
      -- Max cycle length = 4; stop recursion beyond that
      sc.chain_len < 4
)

-- ── STEP 2: Detect cycle closures ───────────────────────────────────────────
--   A cycle closes when the last node's desired_city = start_city AND the
--   start property's availability_window overlaps the last node's desired_window.
SELECT
    sc.chain_len + 1                        AS cycle_size,
    sc.path_display || ' → ' || sc.start_city
                                            AS full_cycle_path,
    sc.path_ids || ',' || sc.start_request_id::TEXT
                                            AS request_id_chain,
    sc.start_property_id                    AS anchor_property_id
FROM swap_chain             sc
JOIN active_requests        closing_node   -- the closing node is the start node
  ON  closing_node.request_id    = sc.start_request_id
  AND closing_node.current_city  = sc.current_city          -- desired_city matches start_city
  AND closing_node.availability_window && sc.current_window -- window overlap for closure
WHERE
    -- We want cycles of length 3 or 4 (chain_len 2-3 means 3-4 total hops)
    sc.chain_len BETWEEN 2 AND 3
    -- Deduplication: only emit the canonical form where start is the smallest
    -- request_id in the path (prevents A→B→C→A and B→C→A→B as two rows)
    AND sc.start_request_id = (
        SELECT MIN(elem::INT)
        FROM unnest(string_to_array(sc.path_ids, ',')) AS elem
    )
ORDER BY cycle_size, full_cycle_path;


-- =============================================================================
-- QUERY 2: FRAUD DETECTION — Properties priced ≥ 80% below city average
-- -----------------------------------------------------------------------------
-- Calculates the mean monthly rent per city (excluding already-flagged rows
-- so fraud doesn't dilute its own average), then surfaces any listing whose
-- rent falls below 20% of that average.
--
-- 80% below average  →  actual_rent < city_avg * 0.20
--
-- Usage: pipe results to an application job that calls the flag_fraud()
-- function, or run directly for reporting.
-- =============================================================================

WITH city_avg_rent AS (
    SELECT
        city,
        ROUND(AVG(monthly_rent), 2)   AS avg_rent,
        COUNT(*)                      AS listing_count
    FROM  Properties
    WHERE is_fraud_flagged = FALSE   -- exclude already-flagged outliers from avg
    GROUP BY city
    HAVING COUNT(*) >= 2             -- need ≥2 data points for a meaningful avg
)

SELECT
    p.id                                                        AS property_id,
    p.address,
    p.city,
    p.monthly_rent                                              AS listed_rent,
    car.avg_rent                                                AS city_avg_rent,
    ROUND(100.0 * (car.avg_rent - p.monthly_rent) / car.avg_rent, 1)
                                                                AS pct_below_avg,
    p.is_fraud_flagged                                          AS already_flagged,
    p.availability_window,
    u.full_name                                                 AS owner_name,
    u.email                                                     AS owner_email
FROM      Properties    p
JOIN      city_avg_rent car ON car.city = p.city
JOIN      Users         u   ON u.id    = p.owner_id
WHERE
    -- Core fraud condition: listed rent is less than 20% of city average
    -- i.e. more than 80% below city average
    p.monthly_rent < (car.avg_rent * 0.20)
ORDER BY
    pct_below_avg DESC,   -- most suspicious first
    p.city;


-- =============================================================================
-- QUERY 3: DIAGNOSTIC — Active swap requests with window-overlap status
-- -----------------------------------------------------------------------------
-- Shows every active request, the city of the property being offered, whether
-- there exists at least one potential matching property in the desired city
-- whose availability_window overlaps the desired_window.
-- Useful for support dashboards.
-- =============================================================================

SELECT
    sr.id                                           AS request_id,
    u.full_name                                     AS requester,
    u.email,
    p.city                                          AS offering_city,
    p.address                                       AS offering_address,
    p.monthly_rent                                  AS offering_rent,
    sr.desired_city,
    sr.desired_window,
    p.availability_window                           AS offering_window,
    -- Does any active property in the desired city overlap the desired window?
    EXISTS (
        SELECT 1
        FROM  Properties target_p
        WHERE target_p.city                  = sr.desired_city
          AND target_p.availability_window  && sr.desired_window
          AND target_p.is_fraud_flagged      = FALSE
          AND target_p.owner_id             <> sr.user_id  -- can't swap with yourself
    )                                               AS has_matching_target,
    sr.created_at                                   AS request_opened_at
FROM  Swap_Requests sr
JOIN  Users         u  ON u.id = sr.user_id
JOIN  Properties    p  ON p.id = sr.current_property_id
WHERE sr.is_active = TRUE
ORDER BY sr.created_at DESC;


-- =============================================================================
-- QUERY 4: SWAP HISTORY — Summary of completed swaps grouped by city pairs
-- -----------------------------------------------------------------------------
-- Aggregates Swap_Log_Entries to show which city-to-city routes are most
-- popular, helping the product team tune the matching engine.
-- =============================================================================

SELECT
    src_prop.city                   AS from_city,
    dst_prop.city                   AS to_city,
    COUNT(DISTINCT ss.swap_group_id) AS total_swaps,
    MAX(ss.executed_at)             AS last_executed,
    AVG(ss.participant_count)::NUMERIC(4,2)
                                    AS avg_participants
FROM  Successful_Swaps  ss
JOIN  Swap_Log_Entries  sle ON sle.swap_group_id = ss.swap_group_id
JOIN  Properties        src_prop ON src_prop.id  = sle.property_id
-- Self-join to pair each participant with the next one in the same swap group
JOIN  Swap_Log_Entries  sle2     ON sle2.swap_group_id = ss.swap_group_id
                                 AND sle2.id            > sle.id
JOIN  Properties        dst_prop ON dst_prop.id  = sle2.property_id
WHERE ss.status = 'COMPLETED'
GROUP BY src_prop.city, dst_prop.city
ORDER BY total_swaps DESC, from_city;

-- =============================================================================
-- END OF FILE: queries.sql
-- =============================================================================
