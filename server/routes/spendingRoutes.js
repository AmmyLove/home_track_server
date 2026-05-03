import express from "express";
import {
  getAllTimeSpending,
  getDailySpending,
  getWeeklySpending,
  getMonthlySpending,
  getMonthlyHistory,
} from "../controllers/spendingController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.get("/all-time", auth, getAllTimeSpending);
router.get("/daily", auth, getDailySpending);
router.get("/weekly", auth, getWeeklySpending);
router.get("/monthly", auth, getMonthlySpending);
router.get("/history", auth, getMonthlyHistory);

export default router;