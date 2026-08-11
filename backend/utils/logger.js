/**
 * logger.js — Centralized structured logger for Shreeji Fashion backend.
 *
 * Uses winston for structured, leveled logging.
 * - In production: JSON output (machine-parseable for log aggregators)
 * - In development: colorized, human-readable output
 *
 * Usage:
 *   const logger = require('../utils/logger');
 *   logger.info('Server started', { port: 5000 });
 *   logger.error('DB connection failed', { error: err.message });
 *
 * Log levels (lowest → highest severity):
 *   debug → info → warn → error
 *
 * In production only warn and error are logged (to reduce noise and cost).
 * Set LOG_LEVEL=debug in .env to enable verbose logging locally.
 */
const { createLogger, format, transports } = require('winston');

const { combine, timestamp, errors, json, colorize, simple } = format;

const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

const logger = createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'warn' : 'debug'),
  format: isProduction
    ? combine(timestamp(), errors({ stack: true }), json())
    : combine(colorize(), timestamp({ format: 'HH:mm:ss' }), errors({ stack: true }), simple()),
  transports: [new transports.Console()],
  // Prevent winston from crashing the process on uncaught errors inside logger itself
  exitOnError: false,
});

module.exports = logger;
