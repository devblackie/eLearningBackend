const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./config/db');
const setupWebSocket = require('./services/websocket');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const collaborationRoutes = require('./routes/collaboration');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS
app.use(cors({
  origin: ['http://localhost:5173', 'https://ukunda-poly-frontend.vercel.app'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 204,
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes);
app.use('/api', authMiddleware, contentRoutes);
app.use('/api', authMiddleware, collaborationRoutes);
app.use('/api', authMiddleware, analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
connectDB();

// WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));