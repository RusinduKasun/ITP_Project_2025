import express from "express";
import { createUser, getUsers } from "../controllers/userController.js";

const router = express.Router();

router.post("/", createUser);   // Add user
router.get("/", getUsers);      // Get all users

export default router;
