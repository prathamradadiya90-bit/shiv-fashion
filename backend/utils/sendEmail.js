const logger = require('./logger');
const { emailQueue } = require('../jobs/emailWorker');

/**
 * Enqueue an email via BullMQ.
 * Returns true on successful enqueue, false on failure.
 */
const sendEmail = async (options) => {
  try {
    if (process.env.NODE_ENV !== 'test') {
      await emailQueue.add('send-email', options, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      });
      logger.info(`[sendEmail] Enqueued email for ${options.email}`);
    }
    return true;
  } catch (error) {
    logger.error(`[sendEmail] Failed to enqueue email for ${options.email}: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
