import express from "express";
import {
  getProductConfigs,
  getProductConfigByType,
  createProductConfig,
  updateProductConfig,
  getProductPrice
} from "../controllers/productConfigController.js";

const router = express.Router();

router.get("/config", getProductConfigs);
router.get("/config/type/:productType", getProductConfigByType);
router.get("/config/price", getProductPrice);
router.post("/", createProductConfig);
router.put("/:id", updateProductConfig);

export default router;