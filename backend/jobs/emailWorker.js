const { Worker, Queue } = require('bullmq');
const nodemailer = require('nodemailer');
const logger = require('../utils/logger');
const connection = require('../config/redis');

// Create the Queue
const emailQueue = new Queue('email-queue', { connection });

// Define the Worker
const emailWorker = new Worker('email-queue', async (job) => {
  const options = job.data;
  
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
}, { connection });

emailWorker.on('completed', (job) => {
  logger.info(`[emailWorker] Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  logger.error(`[emailWorker] Job ${job.id} failed: ${err.message}`);
});

module.exports = { emailQueue, emailWorker };
