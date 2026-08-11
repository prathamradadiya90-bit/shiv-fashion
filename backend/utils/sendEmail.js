const nodemailer = require('nodemailer');
const logger = require('./logger');

/**
 * Send an email via SMTP.
 * Returns true on success, false on failure.
 * Callers should check the return value and decide how to handle failures.
 */
const sendEmail = async (options) => {
  try {
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
      from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    // Log the Nodemailer message-id for audit trails — not the full payload
    logger.info(`[sendEmail] Sent to ${options.email} — messageId: ${info.messageId}`);
    return true;
  } catch (error) {
    // Log full error server-side; caller receives false so it can decide next step
    logger.error(`[sendEmail] Failed to send to ${options.email}: ${error.message}`);
    return false;
  }
};

module.exports = sendEmail;
