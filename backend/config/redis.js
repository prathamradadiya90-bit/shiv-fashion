const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null,
  retryStrategy(times) {
    if (process.env.NODE_ENV === 'test') {
      return null; // Do not retry in test environment
    }
    return Math.min(times * 50, 2000);
  }
};

const connection = new Redis(process.env.REDIS_URL || redisConfig);

connection.on('error', (err) => {
  if (process.env.NODE_ENV !== 'test') {
    logger.error(`[Redis] Connection Error: ${err.message}`);
  }
});

module.exports = connection;
