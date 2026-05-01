const SwapModel = require('../models/swapModel');
const pool = require('../config/db');
const { getIo } = require('../sockets/socketHandler');

exports.matchSwaps = async (req, res) => {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  try {
    const matches = await SwapModel.findMatches(userId);
    res.json({ matches });
  } catch (err) {
    console.error('Error finding swap matches:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.commitSwap = async (req, res) => {
  const { transactionId } = req.body;
  if (!transactionId) return res.status(400).json({ error: 'Missing transactionId' });

  const client = await pool.connect();
  try {
    // SERIALIZABLE isolation level for strict ACID compliance
    await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');

    const tx = await SwapModel.getTransaction(client, transactionId);

    if (!tx) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Transaction not found' });
    }

    if (tx.status !== 'PENDING_COMMIT') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Transaction is not in a pending state' });
    }

    if (new Date() > new Date(tx.expires_at)) {
      await SwapModel.setTransactionStatus(client, transactionId, 'ROLLED_BACK');
      await client.query('COMMIT');
      return res.status(400).json({ error: 'Transaction expired and was rolled back' });
    }

    const leaseIds = tx.lease_chain;

    try {
      await SwapModel.lockLeases(client, leaseIds);
    } catch (lockError) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Lease rows are currently locked by another transaction. Try again.' });
    }

    // Process logic here...
    await SwapModel.setTransactionStatus(client, transactionId, 'COMMITTED');
    await client.query('COMMIT');
    
    // Notify users
    const io = getIo();
    if (io) {
      io.to(`swap_${transactionId}`).emit('swap_committed', { transactionId });
    }
    
    res.json({ message: 'Swap committed successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Transaction failed:', err);
    res.status(500).json({ error: 'Transaction failed and was rolled back' });
  } finally {
    client.release();
  }
};

exports.getUserSwaps = async (req, res) => {
  try {
    const swaps = await SwapModel.getSwapsByUser(req.params.userId);
    res.json(swaps);
  } catch (err) {
    console.error('Error fetching user swaps:', err);
    res.status(500).json({ error: 'Database error' });
  }
};

exports.getTransactionDetails = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT status, lease_chain, expires_at FROM Swap_Transactions WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Transaction not found' });
    const tx = rows[0];

    const chainDetails = [];
    for (const leaseId of tx.lease_chain) {
      const leaseRes = await pool.query(`
        SELECT u.id as user_id, u.full_name as name, p.location as property, p.city, u.role
        FROM Leases l
        JOIN Users u ON l.tenant_id = u.id
        JOIN Properties p ON l.property_id = p.id
        WHERE l.id = $1
      `, [leaseId]);
      if (leaseRes.rows.length > 0) {
        chainDetails.push({ 
          id: leaseRes.rows[0].user_id, 
          name: leaseRes.rows[0].name, 
          property: leaseRes.rows[0].property, 
          city: leaseRes.rows[0].city,
          role: leaseRes.rows[0].role 
        });
      }
    }
    
    res.json({ transaction: tx, chain: chainDetails });
  } catch (err) {
    console.error('Error fetching tx details:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
