import express from "express";
import {
  getIncomes,
  getIncomeById,
  createIncome,
  updateIncome,
  deleteIncome,
  getIncomeSummary,
  getDailyIncome,
} from "../../controllers/Finance/incomeController.js";

const router = express.Router();

router.get("/", getIncomes);
router.get("/summary", getIncomeSummary);
router.get("/daily", getDailyIncome);
router.get("/:id", getIncomeById);
router.post("/", createIncome);
router.put("/:id", updateIncome);
router.delete("/:id", deleteIncome);

export default router;