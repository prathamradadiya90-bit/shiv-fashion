const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const Razorpay = require('razorpay');
const nodemailer = require('nodemailer');
require('dotenv').config();

const testCredentials = async () => {
  console.log('--- STARTING CREDENTIAL VERIFICATION ---\n');

  // 1. Test Database
  try {
    const prisma = new PrismaClient();
    console.log('[TEST 1/4] Connecting to PostgreSQL Database (Aiven)...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ DATABASE: Connection Successful!');
    await prisma.$disconnect();
  } catch (error) {
    console.log('❌ DATABASE ERROR:', error.message);
  }

  // 2. Test Cloudinary
  try {
    console.log('\n[TEST 2/4] Verifying Cloudinary API Keys...');
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'test_cloud',
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    if (!process.env.CLOUDINARY_CLOUD_NAME) {
      console.log('❌ CLOUDINARY ERROR: CLOUDINARY_CLOUD_NAME is empty in .env');
    } else {
      const pingResult = await cloudinary.api.ping();
      if (pingResult.status === 'ok') {
        console.log('✅ CLOUDINARY: Connection Successful!');
      }
    }
  } catch (error) {
    console.log('❌ CLOUDINARY ERROR:', error.message);
  }

  // 3. Test Razorpay
  try {
    console.log('\n[TEST 3/4] Verifying Razorpay Keys...');
    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
    // Try to fetch 1 order to verify auth
    await instance.orders.all({ count: 1 });
    console.log('✅ RAZORPAY: Authentication Successful!');
  } catch (error) {
    console.log('❌ RAZORPAY ERROR:', error.message || error.description || error);
  }

  // 4. Test Nodemailer / SMTP
  try {
    console.log('\n[TEST 4/4] Verifying Nodemailer SMTP (Gmail)...');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true, // true for 465
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    await transporter.verify();
    console.log('✅ SMTP (EMAIL): Connection Successful! App is ready to send emails.');
  } catch (error) {
    console.log('❌ SMTP (EMAIL) ERROR:', error.message);
  }

  console.log('\n--- CREDENTIAL VERIFICATION COMPLETE ---');
};

testCredentials();
