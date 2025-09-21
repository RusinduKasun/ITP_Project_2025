const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB Connection
connectDB();

// Routes (ensure paths match filesystem casing)
app.use('/api/auth', require('./Routes/authRoutes'));
app.use('/api/users', require('./Routes/userRoutes'));
app.use('/api/admin', require('./Routes/adminRoutes'));
app.use('/api/analytics', require('./Routes/AdminanalyticsRoutes'));
app.use('/api/admin/reports', require('./Routes/adminReportRoutes'));
app.use('/api/suppliers', require('./Routes/suppliers'));
app.use('/api/orders', require('./Routes/orders'));
app.use('/api/nadula/product-orders', require('./Routes/Route-nadula/productOrderroute'));
app.use('/api/nadula/addresses', require('./Routes/Route-nadula/AddressRouter'));
app.use('/api/nadula/order-management', require('./Routes/Route-nadula/OrderManagementRoute'));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'User Management API is running' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
