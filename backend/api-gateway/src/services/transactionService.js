const { v4: uuidv4 } = require('uuid');

/**
 * Executes a multi-party swap transaction with strict ACID compliance.
 * Uses row-level locking (SELECT ... FOR UPDATE) to prevent concurrency anomalies.
 * 
 * @param {import('pg').Pool} pool PostgreSQL connection pool
 * @param {number[]} swapRequestIds Array of Swap_Requests IDs that form a cycle
 * @returns {Promise<Object>} The result of the swap
 */
async function executeMultiPartySwap(pool, swapRequestIds) {
    // 1. Acquire a dedicated client connection from the pool for the transaction
    const client = await pool.connect();

    try {
        // 2. Begin Transaction (Atomicity)
        await client.query('BEGIN');

        // 3. Acquire Row-Level Locks (Isolation & Consistency)
        // We lock the swap requests to ensure no other transaction can modify them simultaneously.
        // We order by ID to prevent deadlocks if multiple transactions try to lock the same rows in different orders.
        const sortedIds = [...swapRequestIds].sort((a, b) => a - b);
        
        const lockQuery = `
            SELECT id, user_id, current_property_id, is_active 
            FROM Swap_Requests 
            WHERE id = ANY($1) 
            ORDER BY id 
            FOR UPDATE;
        `;
        
        const lockResult = await client.query(lockQuery, [sortedIds]);
        const lockedRequests = lockResult.rows;

        // Check if all requested rows were found
        if (lockedRequests.length !== swapRequestIds.length) {
            throw new Error("One or more swap requests could not be found or locked.");
        }

        // Check if all are still active
        const inactiveRequests = lockedRequests.filter(req => !req.is_active);
        if (inactiveRequests.length > 0) {
            throw new Error("One or more swap requests are no longer active.");
        }

        // 4. Mark requests as inactive (Swap is happening)
        const updateQuery = `
            UPDATE Swap_Requests 
            SET is_active = FALSE 
            WHERE id = ANY($1);
        `;
        await client.query(updateQuery, [sortedIds]);

        // 5. Log the Successful Swap Transaction (Durability)
        const swapGroupId = uuidv4();
        const participantCount = lockedRequests.length;

        const insertSwapLogQuery = `
            INSERT INTO Successful_Swaps (swap_group_id, participant_count, status)
            VALUES ($1, $2, 'COMPLETED')
            RETURNING swap_group_id;
        `;
        await client.query(insertSwapLogQuery, [swapGroupId, participantCount]);

        // 6. Log individual participants
        const logEntriesValues = lockedRequests.map((req, index) => {
            return `('${swapGroupId}', ${req.user_id}, ${req.current_property_id})`;
        }).join(', ');

        const insertLogEntriesQuery = `
            INSERT INTO Swap_Log_Entries (swap_group_id, user_id, property_id)
            VALUES ${logEntriesValues};
        `;
        await client.query(insertLogEntriesQuery);

        // Simulate potential connection drop or failure to demonstrate rollback capability
        // if (Math.random() < 0.1) throw new Error("Simulated connection drop during swap execution!");

        // 7. Commit Transaction
        await client.query('COMMIT');

        return {
            swapGroupId,
            participantCount,
            status: 'Success'
        };

    } catch (error) {
        // 8. Rollback on any failure (Cascading Rollback)
        await client.query('ROLLBACK');
        console.error("Transaction Aborted. Cascading Rollback Executed.");
        throw error;
    } finally {
        // 9. Release client back to the pool
        client.release();
    }
}

module.exports = {
    executeMultiPartySwap
};
