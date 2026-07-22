/**
 * scripts/testDbConnection.js
 * ──────────────────────────────────────────────────────────────
 * Standalone script to verify MongoDB Atlas connectivity.
 *
 * Usage:
 *   npm run test:db              (from the backend/ directory)
 *   node scripts/testDbConnection.js
 *
 * Exit codes:
 *   0  – Connection successful
 *   1  – Connection failed or MONGODB_URI not set
 * ──────────────────────────────────────────────────────────────
 */

// ─── DNS Fix: force Google DNS for Atlas SRV resolution ───────
// Fixes "querySrv ECONNREFUSED" on corporate/college networks
// that block or fail to resolve MongoDB's SRV DNS records.
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const dotenv    = require('dotenv');
const mongoose  = require('mongoose');
const path      = require('path');

// Load .env from backend root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGO_URI = process.env.MONGODB_URI;

// ─── ANSI helpers (no dependencies) ──────────────────────────
const c = {
  green  : (s) => `\x1b[32m${s}\x1b[0m`,
  red    : (s) => `\x1b[31m${s}\x1b[0m`,
  yellow : (s) => `\x1b[33m${s}\x1b[0m`,
  cyan   : (s) => `\x1b[36m${s}\x1b[0m`,
  bold   : (s) => `\x1b[1m${s}\x1b[0m`,
  grey   : (s) => `\x1b[90m${s}\x1b[0m`,
};

const line   = () => console.log(c.cyan('─'.repeat(60)));
const header = (t) => { line(); console.log(c.bold(`  ${t}`)); line(); };

// ─── Main ─────────────────────────────────────────────────────
(async () => {
  header('MongoDB Atlas Connection Test');

  // ── 1. Check env var ────────────────────────────────────────
  if (!MONGO_URI) {
    console.log(c.red('\n  ✖  MONGODB_URI is NOT set in backend/.env'));
    console.log(c.yellow('\n  → Add the following to backend/.env:\n'));
    console.log('     MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/<dbName>?retryWrites=true&w=majority\n');
    process.exit(1);
  }

  console.log(c.grey('\n  URI    :'), MONGO_URI.replace(/:([^@]+)@/, ':****@'));   // mask password

  // ── 2. Attempt connection ────────────────────────────────────
  const start = Date.now();

  try {
    console.log(c.yellow('\n  🔌  Connecting to MongoDB Atlas…\n'));

    const conn = await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS : 10000,
      connectTimeoutMS         : 10000,
    });

    const elapsed = Date.now() - start;

    console.log(c.green('  ✔   Connection SUCCESSFUL!\n'));
    console.log(`  ${c.cyan('Host')}       : ${conn.connection.host}`);
    console.log(`  ${c.cyan('Database')}   : ${conn.connection.name}`);
    console.log(`  ${c.cyan('Port')}       : ${conn.connection.port || 27017}`);
    console.log(`  ${c.cyan('ReadyState')} : ${conn.connection.readyState} (1 = connected)`);
    console.log(`  ${c.cyan('Latency')}    : ${elapsed}ms`);

    // ── 3. Ping the database ─────────────────────────────────
    console.log(c.yellow('\n  🏓  Pinging database…'));
    await mongoose.connection.db.command({ ping: 1 });
    console.log(c.green('  ✔   Ping successful!'));

    // ── 4. List collections ──────────────────────────────────
    console.log(c.yellow('\n  📂  Fetching collections…'));
    const collections = await mongoose.connection.db.listCollections().toArray();

    if (collections.length === 0) {
      console.log(c.grey('  ℹ   No collections yet (database is empty – that\'s OK).'));
    } else {
      console.log(c.green(`  ✔   Found ${collections.length} collection(s):`));
      collections.forEach((col) => console.log(c.grey(`       • ${col.name}`)));
    }

    line();
    console.log(c.green(c.bold('\n  ✅  All checks passed! MongoDB Atlas is ready.\n')));
    line();
    process.exit(0);

  } catch (error) {
    const elapsed = Date.now() - start;

    console.log(c.red('\n  ✖   Connection FAILED!\n'));
    console.log(`  ${c.cyan('Error')}   : ${error.message}`);
    console.log(`  ${c.cyan('Elapsed')} : ${elapsed}ms`);

    // ── Friendly hints ───────────────────────────────────────
    console.log(c.yellow('\n  💡  Common Fixes:\n'));

    if (error.message.includes('ECONNREFUSED')) {
      console.log('     • Local MongoDB is not running. Start it with: mongod');
    } else if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.log('     • Invalid credentials. Check your MONGODB_URI username/password.');
    } else if (error.message.includes('IP') || error.message.includes('whitelist')) {
      console.log('     • Your IP is not whitelisted in MongoDB Atlas.');
      console.log('       Go to Atlas → Network Access → Add IP Address → Allow from Anywhere (0.0.0.0/0)');
    } else if (error.message.includes('ETIMEDOUT') || error.message.includes('timed out')) {
      console.log('     • Connection timed out. Check your network or Atlas cluster status.');
    } else {
      console.log('     • Verify MONGODB_URI is correct in backend/.env');
      console.log('     • Ensure your IP is whitelisted in MongoDB Atlas Network Access');
      console.log('     • Check that the cluster is active (not paused)');
    }

    line();
    console.log(c.red(c.bold('\n  ❌  Database connection test FAILED.\n')));
    line();
    process.exit(1);
  } finally {
    // Always close the connection after the test
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }
})();
