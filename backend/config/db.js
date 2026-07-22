/**
 * config/db.js
 * ──────────────────────────────────────────────────────────────
 * Manages the MongoDB Atlas cluster connection via Mongoose.
 *
 * Features:
 *  • Singleton connection (safe to call connectDB() multiple times)
 *  • Retry on initial connection failure (up to MAX_RETRIES)
 *  • Full event listeners for monitoring in dev/prod
 *  • Graceful shutdown helper: disconnectDB()
 *  • Exports connection-state helper: isConnected()
 * ──────────────────────────────────────────────────────────────
 */

// ─── DNS Fix: force Google DNS for Atlas SRV resolution ───────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const mongoose = require('mongoose');
const dotenv   = require('dotenv');

dotenv.config();

// ─── Constants ────────────────────────────────────────────────
const MONGO_URI    = process.env.MONGODB_URI;
const MAX_RETRIES  = 5;          // number of connection attempts before giving up
const RETRY_DELAY  = 5000;       // milliseconds between retries

// ─── Mongoose Global Settings ────────────────────────────────
mongoose.set('strictQuery', true);          // suppress Mongoose 7 deprecation warning

// ─── Connection Options ───────────────────────────────────────
const mongooseOptions = {
  serverSelectionTimeoutMS : 10000,   // give up initial connection after 10s
  socketTimeoutMS          : 45000,   // close sockets after 45s of inactivity
  maxPoolSize              : 10,      // maintain up to 10 socket connections
  minPoolSize              : 2,       // keep at least 2 connections open
  connectTimeoutMS         : 10000,   // wait 10s before timing out
  heartbeatFrequencyMS     : 10000,   // check server health every 10s
  retryWrites              : true,
  w                        : 'majority',
};

// ─── Event Listeners (registered once) ───────────────────────
let _listenersAttached = false;

const _attachListeners = () => {
  if (_listenersAttached) return;
  _listenersAttached = true;

  const db = mongoose.connection;

  db.on('connected', () => {
    console.log('✅  MongoDB  →  connected to', db.host || 'cluster');
  });

  db.on('disconnected', () => {
    console.warn('⚠️   MongoDB  →  disconnected');
  });

  db.on('reconnected', () => {
    console.log('🔄  MongoDB  →  reconnected');
  });

  db.on('error', (err) => {
    console.error('❌  MongoDB  →  error:', err.message);
  });

  db.on('close', () => {
    console.log('🔒  MongoDB  →  connection closed');
  });
};

// ─── connectDB ────────────────────────────────────────────────
/**
 * Establishes (or reuses) the Mongoose connection to MongoDB.
 *
 * @param {number} [retryCount=0] - internal retry counter (do not pass manually)
 * @returns {Promise<typeof mongoose>}
 */
const connectDB = async (retryCount = 0) => {
  // Already connected – return the existing instance
  if (mongoose.connection.readyState === 1) {
    console.log('ℹ️   MongoDB  →  already connected (skipping reconnect)');
    return mongoose;
  }

  if (!MONGO_URI) {
    throw new Error(
      'MONGODB_URI is not defined.\n' +
      'Add MONGODB_URI=<your-atlas-connection-string> to backend/.env'
    );
  }

  _attachListeners();

  try {
    console.log(`🔌  MongoDB  →  connecting… (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    const conn = await mongoose.connect(MONGO_URI, mongooseOptions);

    console.log(`\n🎉  MongoDB Atlas Connected!`);
    console.log(`    Host     : ${conn.connection.host}`);
    console.log(`    Database : ${conn.connection.name}`);
    console.log(`    Port     : ${conn.connection.port || 27017}\n`);

    return conn;
  } catch (error) {
    console.error(`❌  MongoDB connection error (attempt ${retryCount + 1}): ${error.message}`);

    if (retryCount < MAX_RETRIES - 1) {
      console.log(`⏳  Retrying in ${RETRY_DELAY / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      return connectDB(retryCount + 1);
    }

    // All retries exhausted
    console.error(`🚨  Failed to connect to MongoDB after ${MAX_RETRIES} attempts. Exiting.`);
    process.exit(1);
  }
};

// ─── disconnectDB ─────────────────────────────────────────────
/**
 * Gracefully closes the Mongoose connection.
 * Call this on SIGINT/SIGTERM or after tests.
 *
 * @returns {Promise<void>}
 */
const disconnectDB = async () => {
  if (mongoose.connection.readyState === 0) return;
  await mongoose.connection.close();
  console.log('🔒  MongoDB  →  connection closed gracefully');
};

// ─── isConnected ─────────────────────────────────────────────
/**
 * Returns true when the Mongoose connection is fully open.
 *
 * @returns {boolean}
 */
const isConnected = () => mongoose.connection.readyState === 1;

// ─── Graceful Shutdown ────────────────────────────────────────
const _shutdown = async (signal) => {
  console.log(`\n🛑  Received ${signal}. Closing MongoDB connection…`);
  await disconnectDB();
  process.exit(0);
};

process.on('SIGINT',  () => _shutdown('SIGINT'));
process.on('SIGTERM', () => _shutdown('SIGTERM'));

// ─── Exports ──────────────────────────────────────────────────
module.exports = { connectDB, disconnectDB, isConnected, mongoose };
