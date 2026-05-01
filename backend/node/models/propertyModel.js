const pool = require('../config/db');

class PropertyModel {
  static async insertProperty(ownerId, listedPrice, location, trueValuation) {
    const result = await pool.query(
      'INSERT INTO Properties (owner_id, listed_price, location, true_valuation) VALUES ($1, $2, $3, $4) RETURNING *',
      [ownerId, listedPrice, location, trueValuation]
    );
    return result.rows[0];
  }

  static async getPropertiesByUser(userId) {
    const query = `
      SELECT id, location, listed_price, true_valuation, status, created_at
      FROM Properties
      WHERE owner_id = $1
      ORDER BY created_at DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  }
}

module.exports = PropertyModel;
