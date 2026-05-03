import express from "express";
import {
  logConsumption,
  getConsumptions,
  getUsageInsights,
} from "../controllers/consumptionController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/", auth, getConsumptions);
router.post("/", auth, logConsumption);
router.get("/insights", auth, getUsageInsights);

export default router;