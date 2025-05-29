const express = require('express');
const http = require('http');
const cors = require('cors');
const multer = require('multer');
const connectDB = require('./config/db');
const setupWebSocket = require('./services/websocket');
const authRoutes = require('./routes/auth');
const contentRoutes = require('./routes/content');
const collaborationRoutes = require('./routes/collaboration');
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const authMiddleware = require('./middleware/auth');
const config = require('./config/config');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// CORS configuration
app.use(cors({
    origin: [
      'http://localhost:5173', // Allow local Vite dev server
     'https://ukunda-poly-frontend.vercel.app/' // Add your Vercel front-end URL
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', authRoutes); // Public route for login/register
app.use('/api', authMiddleware, contentRoutes); // Protected routes
app.use('/api', authMiddleware, collaborationRoutes);
app.use('/api', authMiddleware, analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Connect to MongoDB
connectDB();

// Setup WebSocket
setupWebSocket(server);

const PORT = config.port || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));