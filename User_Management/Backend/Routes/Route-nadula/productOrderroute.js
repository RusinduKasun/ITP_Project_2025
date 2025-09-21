const express = require("express");
const router = express.Router();
// Correct relative path to controllers folder
const UserController = require("../../Controllers/Controlers-nadula/productOrdercontroller");

router.get("/", UserController.getAllUsers);
router.post("/", UserController.addUsers);
router.get("/:id", UserController.getById);
router.put("/:id", UserController.updateUser);
router.delete("/:id", UserController.deleteUser);

module.exports = router;
