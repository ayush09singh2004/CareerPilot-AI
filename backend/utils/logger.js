/**
 * utils/logger.js
 * ──────────────────────────────────────────────────────────────
 * Lightweight structured logger with log-level support and
 * colourised console output (no external dependencies).
 * ──────────────────────────────────────────────────────────────
 */

// ANSI colour codes
const COLOURS = {
  reset  : '\x1b[0m',
  bright : '\x1b[1m',
  dim    : '\x1b[2m',
  red    : '\x1b[31m',
  green  : '\x1b[32m',
  yellow : '\x1b[33m',
  blue   : '\x1b[34m',
  magenta: '\x1b[35m',
  cyan   : '\x1b[36m',
  white  : '\x1b[37m',
  grey   : '\x1b[90m',
};

// Log levels in ascending severity
const LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };

// Current log level (set via LOG_LEVEL env or default to 'info')
const currentLevel = LEVELS[process.env.LOG_LEVEL?.toLowerCase()] ?? LEVELS.info;

// ─── Helpers ──────────────────────────────────────────────────
const _timestamp = () =>
  new Date().toISOString().replace('T', ' ').slice(0, 23);

const _colourize = (colour, text) =>
  `${COLOURS[colour]}${text}${COLOURS.reset}`;

const _label = (level) => {
  const map = {
    debug : _colourize('cyan',    '[DEBUG]'),
    info  : _colourize('green',   '[INFO ]'),
    warn  : _colourize('yellow',  '[WARN ]'),
    error : _colourize('red',     '[ERROR]'),
  };
  return map[level] || level.toUpperCase();
};

const _format = (level, ...args) => {
  const ts  = _colourize('grey', _timestamp());
  const lbl = _label(level);
  return [ts, lbl, ...args];
};

// ─── Logger ───────────────────────────────────────────────────
const logger = {
  debug : (...args) => { if (currentLevel <= LEVELS.debug) console.debug(..._format('debug', ...args)); },
  info  : (...args) => { if (currentLevel <= LEVELS.info)  console.info(..._format('info',  ...args)); },
  warn  : (...args) => { if (currentLevel <= LEVELS.warn)  console.warn(..._format('warn',  ...args)); },
  error : (...args) => { if (currentLevel <= LEVELS.error) console.error(..._format('error', ...args)); },

  /** Log a section divider for readability */
  divider: (title = '') => {
    const line = '─'.repeat(60);
    console.log(_colourize('blue', title ? `\n${line}\n  ${title}\n${line}` : `\n${line}`));
  },

  /** Highlight a key-value pair */
  kv: (key, value) => {
    console.log(
      `  ${_colourize('cyan', key.padEnd(12))} : ${_colourize('white', String(value))}`
    );
  },
};

module.exports = logger;
