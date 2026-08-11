const { PrismaClient } = require('@prisma/client');

// Cap the connection pool so the DB is never overwhelmed under load.
// Vercel/serverless: keep pool small (each function invocation gets its own pool).
// Long-running server (Render): a pool of 5–10 is safe for a single instance.
// Override via DATABASE_URL query params (?connection_limit=10) or the env var below.
const connectionLimit = parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 5;

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Prisma reads `connection_limit` from the DATABASE_URL query string.
  // Setting it explicitly here via log options is not supported, so the
  // recommended approach is to append ?connection_limit=N to DATABASE_URL.
  // As a belt-and-suspenders guard, we also log a warning if the env var
  // is missing so it is never silently unlimited.
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'info', 'warn', 'error']
    : ['warn', 'error'],
});

// Warn at startup if the pool limit has not been explicitly set.
// Set DB_CONNECTION_LIMIT in .env or append ?connection_limit=5 to DATABASE_URL.
// NOTE: intentionally using console.warn here — logger.js requires winston which
// in turn could create a circular require chain in some module systems.
if (!process.env.DB_CONNECTION_LIMIT && !process.env.DATABASE_URL?.includes('connection_limit')) {
  // eslint-disable-next-line no-console
  console.warn(
    `[db] WARNING: connection_limit not set in DATABASE_URL and DB_CONNECTION_LIMIT env var is missing. ` +
    `Defaulting to ${connectionLimit}. Add ?connection_limit=${connectionLimit} to DATABASE_URL to suppress this warning.`
  );
}

module.exports = prisma;
