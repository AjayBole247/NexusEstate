const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const { initSockets } = require('./sockets/socketHandler');

const swapRoutes = require('./routes/swapRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const authRoutes = require('./routes/authRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initSockets(server);

// Middleware
app.use(cors());
app.use(express.json());

// Mount Routes
app.use('/api/swaps', swapRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/analytics', analyticsRoutes);

// Start Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
