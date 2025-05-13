const express = require('express');
const http = require('http');
const connectDB = require('./config/db');
const setupWebSocket = require('./services/websocket');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const collaborationRoutes = require('./routes/collaboration');
const analyticsRoutes = require('./routes/analytics');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());

// Routes
app.use('/api', authRoutes); // Public route for login/register
app.use('/api', authMiddleware, contentRoutes); // Protected routes
app.use('/api', authMiddleware, collaborationRoutes);
app.use('/api', authMiddleware, analyticsRoutes);

// Connect to MongoDB
connectDB();

// Setup WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));