const pool = require('../config/db');

exports.upsertUser = async (email, name, role) => {
  const query = `
    INSERT INTO Users (email, full_name, role)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) 
    DO UPDATE SET full_name = EXCLUDED.full_name
    RETURNING id, email, full_name, role;
  `;
  const result = await pool.query(query, [email, name, role]);
  return result.rows[0];
};

exports.getUserById = async (id) => {
  const result = await pool.query('SELECT id, email, full_name, role FROM Users WHERE id = $1', [id]);
  return result.rows[0];
};
