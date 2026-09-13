const { Worker, Queue } = require('bullmq');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const connection = require('../config/redis');

let emailQueue, emailWorker;

const processEmailJob = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 465,
    secure: (Number(process.env.SMTP_PORT) || 465) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const message = {
    from: `${process.env.SMTP_FROM_NAME || 'Shreeji Fashion'} <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  logger.info(`[emailWorker] Sent to ${options.email} — messageId: ${info.messageId}`);
  return info.messageId;
};

if (process.env.NODE_ENV !== 'production') {
  // Use synchronous email sending if Redis is not configured
  emailQueue = { 
    add: async (name, options) => {
      logger.info(`[emailQueue] Sending email synchronously to ${options.email} (Redis disabled)`);
      try {
        await processEmailJob(options);
      } catch (err) {
        logger.error(`[emailWorker] Failed to send email: ${err.message}`);
      }
    } 
  };
  emailWorker = { on: () => {} };
} else {
  // Create the Queue
  emailQueue = new Queue('email-queue', { connection });

  // Define the Worker
  emailWorker = new Worker('email-queue', async (job) => {
    return await processEmailJob(job.data);
  }, { connection });

  emailWorker.on('completed', (job) => {
    logger.info(`[emailWorker] Job ${job.id} completed successfully`);
  });

  emailWorker.on('failed', (job, err) => {
    logger.error(`[emailWorker] Job ${job.id} failed: ${err.message}`);
  });
  
  emailWorker.on('error', (err) => {
    logger.error(`[emailWorker] Redis Error: ${err.message}`);
  });
  
  emailQueue.on('error', (err) => {
    logger.error(`[emailQueue] Redis Error: ${err.message}`);
  });
}

module.exports = { emailQueue, emailWorker };
