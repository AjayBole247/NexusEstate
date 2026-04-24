require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const transactionService = require('./services/transactionService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize PostgreSQL Connection Pool
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'nexusestate',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'API Gateway' });
});

// Bridge Endpoint: Calls the Python Swap Engine for graph cycle detection
// The frontend calls this endpoint, Node.js fetches relevant swap data from DB (mocked here), 
// and sends it to Python for heavy graph processing.
const axios = require('axios');
app.post('/api/cycles/detect', async (req, res) => {
    console.log("--- START CYCLE DETECTION ---");
    try {
        // 1. Fetch from DB
        // We JOIN with the Properties table to get the current_city, which is required by the Python graph logic.
        // We select only the necessary fields to avoid JSON serialization issues with PostgreSQL's daterange type.
        const query = `
            SELECT 
                sr.id, 
                sr.user_id, 
                p.city AS current_city, 
                sr.desired_city,
                sr.desired_window::TEXT AS desired_window  -- Added this line!
        FROM Swap_Requests sr
        JOIN Properties p ON sr.current_property_id = p.id
        WHERE sr.is_active = TRUE
    `;
        const result = await pool.query(query);
        console.log(`Step 1: Found ${result.rows.length} active requests in Database.`);

        // 2. Call Python
        console.log("Step 2: Sending data to Python Swap Engine...");
        const response = await axios.post('http://localhost:8000/api/cycles/detect', {
            requests: result.rows
        });

        console.log("Step 3: Python returned:", response.data);
        res.json(response.data);
    } catch (error) {
        console.error("ERROR:", error.message);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to handle the final swap execution (Triggered after Graph Engine detects a cycle)
// Expects an array of swap request IDs that form a cycle.
app.post('/api/swaps/execute', async (req, res) => {
    const { cycleSwapRequestIds } = req.body;

    if (!cycleSwapRequestIds || !Array.isArray(cycleSwapRequestIds) || cycleSwapRequestIds.length < 2) {
        return res.status(400).json({ error: 'Invalid cycle data provided' });
    }

    try {
        const result = await transactionService.executeMultiPartySwap(pool, cycleSwapRequestIds);
        res.status(200).json({
            message: 'Multi-party swap executed successfully',
            data: result
        });
    } catch (error) {
        console.error("Swap Execution Failed:", error);
        res.status(500).json({
            error: 'Swap execution failed. Transaction rolled back.',
            details: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});
