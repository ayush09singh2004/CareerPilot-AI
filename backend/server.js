/**
 * server.js – CareerPilot AI Backend Entry Point
 * ──────────────────────────────────────────────
 * Boots the Express server and connects to MongoDB Atlas.
 * The MongoDB connection is managed by config/db.js which
 * provides retry logic, event listeners, and graceful shutdown.
 */

const express        = require('express');
const cors           = require('cors');
const dotenv         = require('dotenv');
const path           = require('path');
const { connectDB }  = require('./config/db');
const logger         = require('./utils/logger');
const authRoutes     = require('./routes/authRoutes');
const resumeRoutes   = require('./routes/resumeRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// ─── Environment ──────────────────────────────────────────────
dotenv.config();

// ─── Express App ──────────────────────────────────────────────
const app = express();

// ─── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Static files: serve uploaded avatars ─────────────────────
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── Request Logger (dev only) ────────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  app.use((req, _res, next) => {
    logger.debug(`${req.method} ${req.originalUrl}`);
    next();
  });
}

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const { isConnected } = require('./config/db');
  res.status(200).json({
    status     : 'ok',
    message    : 'CareerPilot AI API is running',
    db         : isConnected() ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
    timestamp  : new Date().toISOString(),
  });
});

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/resume',   resumeRoutes);
app.use('/api/analysis', analysisRoutes);

// Placeholder
app.use('/api/job', (req, res) => res.json({ message: 'Job Match endpoint – coming soon' }));

// ─── 404 Handler ──────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  logger.error(err.stack || err.message);
  res.status(err.status || 500).json({
    message: 'Something went wrong!',
    error  : process.env.NODE_ENV === 'production' ? undefined : err.message,
  });
});

// ─── Boot Sequence ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect to MongoDB Atlas first, then start listening
  await connectDB();

  app.listen(PORT, () => {
    logger.divider('CareerPilot AI – Server Started');
    logger.kv('Mode',    process.env.NODE_ENV || 'development');
    logger.kv('Port',    PORT);
    logger.kv('URL',     `http://localhost:${PORT}`);
    logger.kv('Health',  `http://localhost:${PORT}/api/health`);
    console.log('');
  });
};

startServer();

module.exports = app;   // exported for testing purposes
