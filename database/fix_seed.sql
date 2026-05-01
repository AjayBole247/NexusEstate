-- create mock data for swap UI
DO $$
DECLARE
    user1_id UUID;
    user2_id UUID;
    user3_id UUID;
BEGIN
    SELECT id INTO user1_id FROM Users LIMIT 1 OFFSET 0;
    SELECT id INTO user2_id FROM Users LIMIT 1 OFFSET 1;
    SELECT id INTO user3_id FROM Users LIMIT 1 OFFSET 2;

    -- Create Properties
    INSERT INTO Properties (id, owner_id, location, city, listed_price) VALUES
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user1_id, 'Downtown Loft', 'Mumbai', 5000),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', user2_id, 'Suburban House', 'Delhi', 4000),
    ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', user3_id, 'Beach Condo', 'Goa', 6000)
    ON CONFLICT DO NOTHING;

    -- Create Leases
    INSERT INTO Leases (id, property_id, tenant_id, start_date, end_date) VALUES
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', user1_id, '2026-05-01', '2026-06-01'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', user2_id, '2026-05-01', '2026-06-01'),
    ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13', user3_id, '2026-05-01', '2026-06-01')
    ON CONFLICT DO NOTHING;

    -- Create Swap Transaction
    INSERT INTO Swap_Transactions (id, status, lease_chain, expires_at) VALUES
    ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'PENDING_COMMIT', '["c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11", "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a12", "c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a13"]', NOW() + INTERVAL '1 hour')
    ON CONFLICT DO NOTHING;
END $$;
