import express from "express";
import {
    getAllUsers,
    addUsers,
    getById,
    updateUser,
    deleteUser,
} from "../../controllers/Customer/productOrdercontroller.js";

const router = express.Router();

// @route   GET /api/product-orders
// @desc    Get all product orders
router.get("/", getAllUsers);

// @route   POST /api/product-orders
// @desc    Add a new product order
router.post("/", addUsers);

// @route   GET /api/product-orders/:id
// @desc    Get a product order by ID
router.get("/:id", getById);

// @route   PUT /api/product-orders/:id
// @desc    Update a product order
router.put("/:id", updateUser);

// @route   DELETE /api/product-orders/:id
// @desc    Delete a product order
router.delete("/:id", deleteUser);

export default router;
