const pool = require('./config/db');

async function fixDB() {
  try {
    console.log("Adding full_name column to Users...");
    await pool.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);');
    
    // Create the schema if it hasn't been created yet
    console.log("Applying schema.sql if not exists...");
    const fs = require('fs');
    const path = require('path');
    const schema = fs.readFileSync(path.join(__dirname, '../../database/schema.sql'), 'utf8');
    await pool.query(schema);
    
    // Add the column again just in case the schema was freshly executed and overwrote it
    await pool.query('ALTER TABLE Users ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);');
    
    console.log("Database fixed successfully.");
  } catch (err) {
    console.error("Error fixing database:", err);
  } finally {
    pool.end();
  }
}

fixDB();
