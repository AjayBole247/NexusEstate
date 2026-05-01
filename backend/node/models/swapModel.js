const pool = require('../config/db');

class SwapModel {
  static async findMatches(userId) {
    const query = `
      WITH RECURSIVE SwapChain AS (
        SELECT 
          l.id as lease_id, 
          l.tenant_id, 
          p.owner_id as target_owner_id,
          ARRAY[l.id] as chain, 
          1 as depth
        FROM Leases l
        JOIN Properties p ON l.property_id = p.id
        WHERE l.tenant_id = $1

        UNION ALL

        SELECT 
          next_l.id, 
          next_l.tenant_id, 
          next_p.owner_id,
          sc.chain || next_l.id, 
          sc.depth + 1
        FROM SwapChain sc
        JOIN Leases next_l ON next_l.tenant_id = sc.target_owner_id
        JOIN Properties next_p ON next_l.property_id = next_p.id
        WHERE sc.depth < 4
          AND NOT next_l.id = ANY(sc.chain)
      )
      SELECT chain, depth 
      FROM SwapChain 
      WHERE depth >= 3 AND target_owner_id = $1
      LIMIT 10;
    `;
    const { rows } = await pool.query(query, [userId]);
    return rows;
  }

  static async getTransaction(client, transactionId) {
    const { rows } = await client.query(
      'SELECT status, lease_chain, expires_at FROM Swap_Transactions WHERE id = $1',
      [transactionId]
    );
    return rows[0];
  }

  static async setTransactionStatus(client, transactionId, status) {
    await client.query('UPDATE Swap_Transactions SET status = $1 WHERE id = $2', [status, transactionId]);
  }

  static async lockLeases(client, leaseIds) {
    const lockQuery = `
      SELECT id FROM Leases 
      WHERE id = ANY($1::uuid[]) 
      FOR UPDATE NOWAIT
    `;
    await client.query(lockQuery, [leaseIds]);
  }

  static async getSwapsByUser(userId) {
    const query = `
      SELECT st.id, st.status, st.created_at, array_length(st.lease_chain, 1) as participants
      FROM Swap_Transactions st
      WHERE EXISTS (
        SELECT 1 FROM Leases l 
        WHERE l.id = ANY(st.lease_chain) AND l.tenant_id = $1
      )
      ORDER BY st.created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = SwapModel;
