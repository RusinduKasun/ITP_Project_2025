import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './config/db.js';
// Supplier Routes
import suppliersRoute from './routes/Supplier/suppliers.js';
import ordersRoute from './routes/Supplier/orders.js';
// Finance Routes
import expenseRoutes from './routes/Finance/expenseRoutes.js';
import incomeRoutes from './routes/Finance/incomeRoutes.js';
import wastageRoutes from './routes/Finance/wastageRoutes.js';
import productConfigRoutes from './routes/Finance/productConfigRoutes.js';
import financeRoutes from './routes/Finance/financeRoutes.js';
// Customer Routes
import productOrderRoute from './routes/Customer/productOrderroute.js';
import addressRoute from './routes/Customer/AddressRouter.js';
// Admin Routes
import adminRoutes from './routes/Admin/adminRoutes.js';
import authRoutes from './routes/Admin/authRoutes.js';
import userRoutes from './routes/Admin/userRoutes.js';
// Inventory Routes
import inventoryRoutes from './routes/Inventory/inventoryRoute.js';
import productionRoutes from './routes/Inventory/productionRoute.js';
import fruitRoutes from "./routes/Inventory/fruitRoute.js";
import notificationRoutes from './routes/Inventory/notificationRoute.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
<<<<<<< HEAD
app.use(cors({
  origin: 'http://localhost:5173',
=======
// Allow localhost origins used by dev frontend and local tools
const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g., Postman, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
>>>>>>> 23b237e349add8e13cc82753aa12c6977990fe75
  credentials: true
}));
// Allow larger JSON payloads (e.g., base64 images) up to 10MB
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files statically from /uploads
app.use('/uploads', express.static(path.resolve('./uploads')));
// Connect DB
connectDB();

// Routes
app.use('/api/suppliers', suppliersRoute);
app.use('/api/orders', ordersRoute);
// Finance Routes
app.use('/api/products', productConfigRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/incomes', incomeRoutes);
app.use('/api/wastage', wastageRoutes);
// Customer Routes
app.use('/api/productOrder', productOrderRoute);
app.use('/api/addresses', addressRoute);
// Admin Routes
app.use('/api/admin', adminRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
// Inventory Routes
<<<<<<< HEAD
=======
// Mount notification routes first so '/api/inventory/notifications' does not collide with inventory/:id
app.use('/api/inventory/notifications', notificationRoutes);
>>>>>>> 23b237e349add8e13cc82753aa12c6977990fe75
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use("/api/fruits", fruitRoutes);

app.get('/', (req, res) => res.send('Fruit Seller API is running'));

<<<<<<< HEAD
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
=======
// Simple health endpoint for troubleshooting
app.get('/health', (req, res) => res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' }));

// Bind explicitly to 0.0.0.0 to avoid IPv6/localhost binding issues on some Windows setups
const host = process.env.HOST || '0.0.0.0';
const server = app.listen(PORT, host, () => {
  try {
    const addr = server.address();
    const address = addr && addr.address ? addr.address : 'unknown';
    const port = addr && addr.port ? addr.port : PORT;
    console.log(`Server running and listening on http://${address}:${port}`);
  } catch (err) {
    console.log(`Server running on port ${PORT}`);
  }
});
>>>>>>> 23b237e349add8e13cc82753aa12c6977990fe75
