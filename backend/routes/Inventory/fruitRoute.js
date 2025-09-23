import express from "express";
import {
  getAllFruits,
  getFruitById,
  addFruit,
  updateFruit,
  deleteFruit,
} from "../../controllers/Inventory/fruitController.js";

const router = express.Router();

router.get("/", getAllFruits);
router.get("/:id", getFruitById);
router.post("/", addFruit);
router.put("/:id", updateFruit);
router.delete("/:id", deleteFruit);

export default router;
