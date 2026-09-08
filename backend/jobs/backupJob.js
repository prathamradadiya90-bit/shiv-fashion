const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');

const backupDatabase = () => {
  try {
    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
    const dbUrl = process.env.DATABASE_URL || '';

    if (dbUrl.startsWith('postgres')) {
      const backupFile = path.join(backupDir, `backup-${dateStr}.sql`);
      logger.info(`Starting PostgreSQL backup to ${backupFile}`);
      
      exec(`pg_dump "${dbUrl}" -F c -f "${backupFile}"`, (error, stdout, stderr) => {
        if (error) {
          logger.error(`PostgreSQL backup failed: ${error.message}`);
          return;
        }
        logger.info(`PostgreSQL backup completed successfully: ${backupFile}`);
      });
    } else if (dbUrl.startsWith('file:') || dbUrl.includes('.db')) {
      // SQLite backup
      const dbPath = dbUrl.replace('file:', '');
      const sourceFile = path.resolve(__dirname, '../../', dbPath);
      const backupFile = path.join(backupDir, `backup-${dateStr}.db`);
      
      if (fs.existsSync(sourceFile)) {
        logger.info(`Starting SQLite backup to ${backupFile}`);
        fs.copyFileSync(sourceFile, backupFile);
        logger.info(`SQLite backup completed successfully: ${backupFile}`);
      } else {
        logger.error(`SQLite database file not found: ${sourceFile}`);
      }
    } else {
      logger.warn('Unknown DATABASE_URL format. Cannot perform automated backup.');
    }
  } catch (error) {
    logger.error(`Error in backup job: ${error.message}`);
  }
};

const scheduleBackupJob = () => {
  // Run daily at 2:00 AM
  cron.schedule('0 2 * * *', () => {
    logger.info('Running scheduled daily database backup...');
    backupDatabase();
  });
};

module.exports = { scheduleBackupJob, backupDatabase };
