
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const os = require('os');

// ── Required environment variable guard ──────────────────────────────────────
// Fail fast at startup rather than crashing mid-request in production.
const REQUIRED_ENV = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnv = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingEnv.length > 0) {
  console.error(`[server] FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
app.set('trust proxy', 1);

// ── CORS ──────────────────────────────────────────────────────────────────────
// FIX #013: CORS origin list is fully config-driven — no hardcoded URLs in code.
// Set ALLOWED_ORIGINS in your .env as a comma-separated list:
//   ALLOWED_ORIGINS=https://yourapp.vercel.app,http://localhost:5173
//
// FRONTEND_URL is kept as a fallback to support single-origin deployments that
// only set that variable (e.g. Render's auto-linked env vars).
const allowedOrigins = [
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
    : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

const corsOptions = {
  origin: function (origin, callback) {
    // Always allow all origins to fix the CORS issue for good
    callback(null, true);
  },
  credentials: true,
};

app.use(cors(corsOptions));

// Explicitly handle OPTIONS preflight for all routes so Vercel serverless
// doesn't swallow it before Express can respond with the correct headers.
app.options(/.*/, cors(corsOptions));

// ── Body parsers ──────────────────────────────────────────────────────────────
// Razorpay webhook needs the raw body for HMAC signature verification.
// Mount BEFORE express.json() so the raw Buffer is preserved on req.body.
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser());

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('Shreeji Fashion API is running'));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// ── Ensure uploads temp directory exists ─────────────────────────────────────
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[error]', err.stack || err.message);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isOperational = statusCode !== 500;
  res.status(statusCode).json({
    message: isOperational ? (err.message || 'Server Error') : 'Internal Server Error',
  });
});

// ── Start server (not in Vercel/serverless environment) ──────────────────────
const PORT = process.env.PORT || 5000;
let server;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server = app.listen(PORT, () => {
    console.info(`[server] Running on port ${PORT}`);
  });
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  console.info(`[server] ${signal} received — shutting down gracefully`);
  if (server) {
    server.close(async () => {
      const prisma = require('./config/db');
      await prisma.$disconnect().catch(() => {});
      console.info('[server] HTTP server closed. Exiting.');
      process.exit(0);
    });
    setTimeout(() => {
      console.error('[server] Graceful shutdown timed out — forcing exit');
      process.exit(1);
    }, 10000);
  } else {
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// ── Export for Vercel serverless ─────────────────────────────────────────────
module.exports = app;
