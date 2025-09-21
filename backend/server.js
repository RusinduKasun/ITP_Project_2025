import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import suppliersRoute from './routes/suppliers.js';
import ordersRoute from './routes/orders.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// connect DB
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/suppliers', suppliersRoute);
app.use('/api/orders', ordersRoute);

app.get('/', (req, res) => res.send('Fruit Seller API is running'));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
