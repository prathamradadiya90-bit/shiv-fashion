require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins
    callback(null, true);
  },
  credentials: true
}));

// Test Route
app.get('/', (req, res) => {
  res.send('Shreeji Fashion API is running');
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));

// Ensure uploads directory exists (use /tmp on Vercel)
const fs = require('fs');
const os = require('os');
const uploadDir = process.env.VERCEL ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({ message: err.message || 'Server Error' });
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

// Export app for serverless deployment (e.g., Vercel)
module.exports = app;
