const pool = require('../config/db');

class PropertyModel {
  static async getPropertyById(id) {
    const query = `
      SELECT id, title, listing_type, price, sqft, bhk, bathrooms, locality, city, dist_metro_km, dist_highway_km, has_pool, has_gym, image_url
      FROM properties
      WHERE id = $1;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  static async getAllProperties() {
    const query = `
      SELECT id, title, listing_type, price, sqft, bhk, bathrooms, locality, city, dist_metro_km, dist_highway_km, has_pool, has_gym, image_url
      FROM properties
      ORDER BY city, locality;
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = PropertyModel;
