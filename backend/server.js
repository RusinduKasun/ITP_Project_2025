import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import rawMaterialRoutes from "./routes/rawMaterialRoutes.js";
import finishedProductRoutes from "./routes/finishedProductRoutes.js";
import productionRoutes from "./routes/productionRoutes.js";
import stockMovementRoutes from "./routes/stockMovementRoutes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

connectDB();

// Health check
app.get("/", (_req, res) => res.send("Inventory API running"));

// Mount feature routes under /api
app.use("/api/raw-materials", rawMaterialRoutes);
app.use("/api/finished-products", finishedProductRoutes);
app.use("/api/productions", productionRoutes);
app.use("/api/stock-movements", stockMovementRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`API listening on port ${PORT}`));
