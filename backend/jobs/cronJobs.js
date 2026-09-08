const cron = require('node-cron');
const prisma = require('../config/db');
const logger = require('../utils/logger');
const { scheduleBackupJob } = require('./backupJob');

const startCronJobs = () => {
  // Start the database backup job
  scheduleBackupJob();

  // Run every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running cleanup for abandoned PENDING orders...');
    try {
      const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);
      
      const abandonedOrders = await prisma.order.findMany({
        where: {
          status: 'PENDING',
          paymentStatus: 'UNPAID',
          createdAt: {
            lt: thirtyMinsAgo
          }
        },
        include: {
          items: true
        }
      });

      if (abandonedOrders.length > 0) {
        logger.info(`Found ${abandonedOrders.length} abandoned orders to cancel.`);
        
        for (const order of abandonedOrders) {
          await prisma.$transaction(async (tx) => {
            // Restore stock
            for (const item of order.items) {
              await tx.product.update({
                where: { id: item.productId },
                data: { stock: { increment: item.quantity } }
              });
            }
            
            // Mark order as cancelled
            await tx.order.update({
              where: { id: order.id },
              data: { status: 'CANCELLED' }
            });
            
            // Remove coupon usage if any
            await tx.couponUsage.deleteMany({
              where: { orderId: order.id }
            });
          });
          logger.info(`Cancelled abandoned order ${order.id} and restored stock.`);
        }
      }
    } catch (error) {
      logger.error(`Error in abandoned orders cron job: ${error.message}`);
    }
  });
};

module.exports = { startCronJobs };
