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
app.use(cors({
  origin: 'http://localhost:5173',
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
app.use('/api/inventory', inventoryRoutes);
app.use('/api/production', productionRoutes);
app.use("/api/fruits", fruitRoutes);

app.get('/', (req, res) => res.send('Fruit Seller API is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
