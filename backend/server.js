// backend/server.js
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import incomeRoutes from "./routes/incomeRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import wastageRoutes from "./routes/wastageRoutes.js";
import productConfigRoutes from "./routes/productConfigRoutes.js";
import financeRoutes from "./routes/financeRoutes.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Simple request logger (helps debugging)
app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/products", productConfigRoutes);
app.use("/api/finance", financeRoutes);

// Connect to MongoDB
connectDB().then(() => {
  console.log('✅ MongoDB connection successful');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
});

// Debug middleware for all routes
app.use((req, res, next) => {
  console.log(`[Debug] Accessing: ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use("/api/expenses", expenseRoutes);
app.use("/api/incomes", incomeRoutes);
app.use("/api/users", userRoutes);

// Add wastage routes
app.use("/api/wastage", wastageRoutes);

// Health check route
app.get("/", (req, res) => {
  res.send("Taste of Ceylon Backend is running 🚀");
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n=== Taste of Ceylon Backend Server ===`);
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`\nAvailable Routes:`);
  console.log(`- GET    /api/incomes         (Get all incomes)`);
  console.log(`- POST   /api/incomes         (Create new income)`);
  console.log(`- PUT    /api/incomes/:id     (Update income)`);
  console.log(`- DELETE /api/incomes/:id     (Delete income)`);
  console.log(`- GET    /api/finance/summary (Finance overview)`);
  console.log(`- GET    /api/finance/break-even (Break-even analysis)`);
  console.log(`\n====================================\n`);
});
