const Redis = require('ioredis');
const logger = require('../utils/logger');

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null,
};

const connection = new Redis(process.env.REDIS_URL || redisConfig);

connection.on('error', (err) => {
  logger.error(`[Redis] Connection Error: ${err.message}`);
});

module.exports = connection;
