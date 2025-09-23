const express = require("express");
const {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
} = require("../Controlers-nadula/AddressController");

const router = express.Router();

router.post("/", createAddress);
router.get("/", getAddresses);
router.get("/:id", getAddressById);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);

module.exports = router;



