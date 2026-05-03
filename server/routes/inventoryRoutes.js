import express from "express";
import { getInventory } from "../controllers/inventoryController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getInventory);

export default router;