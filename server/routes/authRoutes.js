import express from "express";
import { register,
  verifyOTP,
  resendOTP,
  login,
  forgotPassword,
  resetPassword,
  getMe, } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, getMe); // auth middleware protects this route
router.post("/verify-otp",      verifyOTP);
router.post("/resend-otp",      resendOTP);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password",  resetPassword);

export default router;

