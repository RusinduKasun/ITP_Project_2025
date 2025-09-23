import express from "express";
import {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} from "../../controllers/Customer/AddressController.js";

const router = express.Router();

// @route   POST /api/addresses
// @desc    Create a new address
router.post("/", createAddress);

// @route   GET /api/addresses
// @desc    Get all addresses
router.get("/", getAddresses);

// @route   GET /api/addresses/:id
// @desc    Get an address by ID
router.get("/:id", getAddressById);

// @route   PUT /api/addresses/:id
// @desc    Update an address
router.put("/:id", updateAddress);

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
router.delete("/:id", deleteAddress);

export default router;



