/**
 * tests/db.test.js
 * ──────────────────────────────────────────────────────────────
 * Jest integration tests for the MongoDB connection module.
 *
 * Run:  npm test               (all tests)
 *       npm run test:db        (standalone connectivity check)
 *
 * Note: Tests use the MONGODB_URI from backend/.env
 *       Set TEST_TIMEOUT in .env to override (default: 30 000ms)
 * ──────────────────────────────────────────────────────────────
 */

// ─── DNS Fix for Atlas SRV on restrictive networks ───────────
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const dotenv   = require('dotenv');
const path     = require('path');

// Load env vars before importing db module
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const mongoose               = require('mongoose');
const { connectDB, disconnectDB, isConnected } = require('../config/db');

// ─── Global timeout for slow Atlas connections ────────────────
const TIMEOUT = parseInt(process.env.TEST_TIMEOUT || '30000', 10);
jest.setTimeout(TIMEOUT);

// ─────────────────────────────────────────────────────────────
// Suite 1 – Environment
// ─────────────────────────────────────────────────────────────
describe('Environment Setup', () => {
  test('MONGODB_URI is defined in environment', () => {
    expect(process.env.MONGODB_URI).toBeDefined();
    expect(process.env.MONGODB_URI.length).toBeGreaterThan(0);
  });

  test('MONGODB_URI starts with a valid scheme', () => {
    const uri = process.env.MONGODB_URI;
    const validSchemes = ['mongodb://', 'mongodb+srv://'];
    const isValid = validSchemes.some((scheme) => uri.startsWith(scheme));
    expect(isValid).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// Suite 2 – Connection Lifecycle
// ─────────────────────────────────────────────────────────────
describe('MongoDB Connection Lifecycle', () => {
  afterAll(async () => {
    // Ensure the connection is closed after all tests in this suite
    await disconnectDB();
  });

  test('connects to MongoDB Atlas successfully', async () => {
    const conn = await connectDB();
    expect(conn).toBeDefined();
    expect(mongoose.connection.readyState).toBe(1);   // 1 = connected
  });

  test('isConnected() returns true when connected', async () => {
    // connectDB was called in the previous test; connection should still be open
    expect(isConnected()).toBe(true);
  });

  test('calling connectDB() twice does not throw (singleton guard)', async () => {
    await expect(connectDB()).resolves.not.toThrow();
    // Still connected
    expect(mongoose.connection.readyState).toBe(1);
  });

  test('connection has a valid host string', () => {
    expect(mongoose.connection.host).toBeTruthy();
  });

  test('connection has a valid database name', () => {
    expect(mongoose.connection.name).toBeTruthy();
  });
});

// ─────────────────────────────────────────────────────────────
// Suite 3 – Database Operations
// ─────────────────────────────────────────────────────────────
describe('MongoDB Database Operations', () => {
  let testCollection;

  beforeAll(async () => {
    if (!isConnected()) {
      await connectDB();
    }
    // Use a dedicated test collection that is cleaned up afterwards
    testCollection = mongoose.connection.db.collection('__connection_test__');
  });

  afterAll(async () => {
    // Drop the temporary test collection and disconnect
    try {
      await testCollection.drop();
    } catch (_) { /* collection may not exist – that's fine */ }
    await disconnectDB();
  });

  test('database responds to ping command', async () => {
    const result = await mongoose.connection.db.command({ ping: 1 });
    expect(result.ok).toBe(1);
  });

  test('can insert a document into a test collection', async () => {
    const doc    = { _testField: 'boilerplate-test', createdAt: new Date() };
    const result = await testCollection.insertOne(doc);
    expect(result.insertedId).toBeDefined();
  });

  test('can find the inserted document', async () => {
    const found = await testCollection.findOne({ _testField: 'boilerplate-test' });
    expect(found).not.toBeNull();
    expect(found._testField).toBe('boilerplate-test');
  });

  test('can delete the test document', async () => {
    const result = await testCollection.deleteMany({ _testField: 'boilerplate-test' });
    expect(result.deletedCount).toBeGreaterThanOrEqual(1);
  });

  test('can list database collections', async () => {
    const collections = await mongoose.connection.db.listCollections().toArray();
    // collections is an array (may be empty for a fresh DB)
    expect(Array.isArray(collections)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────
// Suite 4 – Mongoose Model Smoke Test
// ─────────────────────────────────────────────────────────────
describe('Mongoose Model Integration', () => {
  const TEST_SCHEMA_NAME = 'DbTestModel';

  beforeAll(async () => {
    if (!isConnected()) {
      await connectDB();
    }
  });

  afterAll(async () => {
    // Drop the test model's collection and disconnect
    try {
      await mongoose.connection.db.collection('dbtestmodels').drop();
    } catch (_) { /* ignore */ }
    await disconnectDB();
  });

  test('can define and use a Mongoose model', async () => {
    // Register a temporary schema / model only for this test
    const schema = new mongoose.Schema(
      { label: String, value: Number },
      { timestamps: true }
    );

    // Guard against model re-registration between test reruns
    const Model = mongoose.models[TEST_SCHEMA_NAME]
      ? mongoose.model(TEST_SCHEMA_NAME)
      : mongoose.model(TEST_SCHEMA_NAME, schema);

    const doc = await Model.create({ label: 'test-entry', value: 42 });

    expect(doc._id).toBeDefined();
    expect(doc.label).toBe('test-entry');
    expect(doc.value).toBe(42);
    expect(doc.createdAt).toBeInstanceOf(Date);

    // Clean up
    await Model.deleteMany({});
  });
});

// ─────────────────────────────────────────────────────────────
// Suite 5 – Disconnect
// ─────────────────────────────────────────────────────────────
describe('MongoDB Disconnection', () => {
  test('disconnectDB() closes the connection gracefully', async () => {
    if (!isConnected()) {
      await connectDB();
    }

    await disconnectDB();
    // 0 = disconnected
    expect(mongoose.connection.readyState).toBe(0);
  });

  test('isConnected() returns false after disconnect', () => {
    expect(isConnected()).toBe(false);
  });
});
