import express from "express";
import { getPurchases, createPurchase } from "../controllers/purchaseController.js";
import auth from "../middleware/auth.js";

const router = express.Router();
  
router.get("/", auth, getPurchases);
router.post("/", auth, createPurchase);

export default router;