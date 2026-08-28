
require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');
const os = require('os');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

// ── Required environment variable guard ──────────────────────────────────────
// Fail fast at startup rather than crashing mid-request in production.
const REQUIRED_ENV = [
  'JWT_SECRET',
  'DATABASE_URL',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS',
  'ALLOWED_ORIGINS',
];
const missingEnv = REQUIRED_ENV.filter(v => !process.env[v]);
if (missingEnv.length > 0) {
  // logger not available yet — use console.error intentionally (pre-logger startup)
  console.error(`[server] FATAL: Missing required environment variables: ${missingEnv.join(', ')}`);
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

const logger = require('./utils/logger');
const http = require('http');
const { initSocket } = require('./utils/socket');

// ── Global Exception Guards ────────────────────────────────────────────────────
process.on('unhandledRejection', (reason, promise) => {
  logger.error(`[unhandledRejection] Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

process.on('uncaughtException', (err) => {
  logger.error(`[uncaughtException] Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

const app = express();
app.set('trust proxy', 1);

// Enable response compression (gzip/deflate)
app.use(compression());

// Set security HTTP headers
app.use(helmet());

// Global Rate Limiting: max 500 requests per 15 minutes per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use(globalLimiter);

const httpServer = http.createServer(app);
// Initialize Socket.io on the HTTP server
if (typeof initSocket === 'function' && !process.env.VERCEL) {
  initSocket(httpServer);
}

// ── CORS ──────────────────────────────────────────────────────────────────────
// Restrict CORS to an explicit allowlist of known origins.
// Set ALLOWED_ORIGINS in your .env as a comma-separated list, e.g.:
//   ALLOWED_ORIGINS=https://shreejifashion.vercel.app,https://www.shreejifashion.com
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim()).filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:3000', 'https://shreejifashion.vercel.app', 'https://shiv-fashion.vercel.app'];

if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
} // fallback for local dev

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, or webhooks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['X-CSRF-Token', 'X-Requested-With', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Content-Type', 'Date', 'X-Api-Version', 'Authorization', 'Cookie'],
}));

// ── Body parsers ──────────────────────────────────────────────────────────────
// Razorpay webhook needs the raw body for HMAC signature verification.
// Mount BEFORE express.json() so the raw Buffer is preserved on req.body.
app.use('/api/orders/webhook', express.raw({ type: 'application/json' }));
app.use('/orders/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(cookieParser());

const { generateSitemapXml } = require('./utils/generateSitemapXml');

// ── SEO & Search Engine Crawl Endpoints ─────────────────────────────────────────
app.get('/sitemap.xml', generateSitemapXml);

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain');
  res.send(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /cart\nDisallow: /checkout\nDisallow: /profile\nDisallow: /api/\n\nSitemap: ${process.env.FRONTEND_URL || 'https://shreejifashion.vercel.app'}/sitemap.xml\n`);
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/', (_req, res) => res.send('Shreeji Fashion API is running'));

// ── Routes ────────────────────────────────────────────────────────────────────
const apiRouter = express.Router();
apiRouter.use('/auth', require('./routes/authRoutes'));
apiRouter.use('/users', require('./routes/userRoutes'));
apiRouter.use('/products', require('./routes/productRoutes'));
apiRouter.use('/orders', require('./routes/orderRoutes'));
apiRouter.use('/coupons', require('./routes/couponRoutes'));
apiRouter.use('/stats', require('./routes/statsRoutes'));
apiRouter.use('/upload', require('./routes/uploadRoutes'));
apiRouter.use('/contact', require('./routes/contactRoutes'));
apiRouter.use('/notifications', require('./routes/notificationRoutes'));
apiRouter.use('/addresses', require('./routes/addressRoutes'));
apiRouter.use('/export', require('./routes/exportRoutes'));

apiRouter.get('/config/razorpay', (req, res) => res.json({ keyId: process.env.RAZORPAY_KEY_ID }));
apiRouter.get('/health', (req, res) => res.send('Shreeji Fashion API is running'));

const { protect, superAdmin } = require('./middleware/authMiddleware');

apiRouter.get('/force-migrate', protect, superAdmin, async (req, res) => {
  try {
    const { execSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    const tmpDir = '/tmp/prisma-migrate';
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
    }
    
    const schemaPath = path.join(__dirname, 'prisma/schema.prisma');
    const tmpSchemaPath = path.join(tmpDir, 'schema.prisma');
    fs.copyFileSync(schemaPath, tmpSchemaPath);
    
    const output = execSync(`npx --yes prisma@6.19.3 db push --schema=schema.prisma --accept-data-loss`, {
      cwd: tmpDir,
      env: { ...process.env }
    });
    
    res.send('<pre>' + output.toString() + '</pre>');
  } catch (error) {
    res.status(500).send('<pre>Error: ' + error.message + '\n\nStdout:\n' + (error.stdout ? error.stdout.toString() : '') + '\n\nStderr:\n' + (error.stderr ? error.stderr.toString() : '') + '</pre>');
  }
});

apiRouter.get('/', (req, res) => res.send('Shreeji Fashion API is running (v1)'));

app.use('/api/v1', apiRouter);
app.use('/v1', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// ── Ensure uploads temp directory exists ─────────────────────────────────────
const uploadDir = process.env.VERCEL
  ? path.join(os.tmpdir(), 'uploads')
  
  : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ message: `Not Found - ${req.originalUrl}` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  logger.error({ message: err.message, stack: err.stack });
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  const isOperational = statusCode !== 500;
  res.status(statusCode).json({
    message: isOperational ? (err.message || 'Server Error') : 'Internal Server Error',
    stack: err.stack,
    errorObj: err
  });
});

// ── Start server (not in Vercel/serverless environment) ──────────────────────
const PORT = process.env.PORT || 5000;
let server;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  server = httpServer.listen(PORT, () => {
    logger.info(`[server] Running on port ${PORT}`);
  });
}

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const shutdown = (signal) => {
  logger.info(`[server] ${signal} received — shutting down gracefully`);
  if (server) {
    server.close(async () => {
      const prisma = require('./config/db');
      await prisma.$disconnect().catch(() => {});
      logger.info('[server] HTTP server closed. Exiting.');
      process.exit(0);
    });
    setTimeout(() => {
      logger.error('[server] Graceful shutdown timed out — forcing exit');
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
