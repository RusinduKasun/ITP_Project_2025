import express from "express";
import {
  getFinanceSummary,
  getBreakEvenAnalysis
} from "../controllers/financeController.js";

const router = express.Router();

// Finance overview routes
router.get("/summary", getFinanceSummary);
router.get("/break-even", getBreakEvenAnalysis);

export default router;
