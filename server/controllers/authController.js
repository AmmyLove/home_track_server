// server/controllers/authController.js

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/index.js";
import { sendOTPEmail, sendPasswordResetEmail } from "../services/emailService.js";

const SALT_ROUNDS = 10;

// Generates a random 6-digit OTP code
const generateOTP = () => String(Math.floor(100000 + Math.random() * 900000));

// OTP expires 10 minutes from now
const otpExpiry = () => new Date(Date.now() + 10 * 60 * 1000);

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ── Register ──────────────────────────────────────────────────────
// Creates account and sends OTP — user can't log in until verified
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim())       return res.status(400).json({ error: "Name is required." });
    if (!email?.trim())      return res.status(400).json({ error: "Email is required." });
    if (!password)           return res.status(400).json({ error: "Password is required." });
    if (password.length < 6) return res.status(400).json({ error: "Password must be at least 6 characters." });

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: "An account with that email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const otp = generateOTP();

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      otpCode: otp,
      otpExpiry: otpExpiry(),
    });

    // Send the verification email
    await sendOTPEmail(email, name, otp);

    // Return the user's email so the frontend knows where to send them
    res.status(201).json({
      message: "Account created! Please check your email for your verification code.",
      email: user.email,
      requiresVerification: true,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Verify OTP ────────────────────────────────────────────────────
export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Account not found." });

    if (user.isVerified) {
      return res.status(400).json({ error: "This account is already verified." });
    }

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ error: "No verification code found. Please register again." });
    }

    // Check if OTP has expired
    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "Verification code has expired. Please request a new one." });
    }

    // Check if OTP matches
    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect verification code. Please try again." });
    }

    // Mark user as verified and clear the OTP
    await user.update({
      isVerified: true,
      otpCode: null,
      otpExpiry: null,
    });

    // Log them in immediately after verifying
    const token = createToken(user.id);
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Resend OTP ────────────────────────────────────────────────────
export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Account not found." });
    if (user.isVerified) return res.status(400).json({ error: "Account is already verified." });

    const otp = generateOTP();
    await user.update({ otpCode: otp, otpExpiry: otpExpiry() });
    await sendOTPEmail(email, user.name, otp);

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim()) return res.status(400).json({ error: "Email is required." });
    if (!password)      return res.status(400).json({ error: "Password is required." });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ error: "Invalid email or password." });

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return res.status(401).json({ error: "Invalid email or password." });

    // Block login if email not verified
    if (!user.isVerified) {
      // Resend a fresh OTP so they can verify
      const otp = generateOTP();
      await user.update({ otpCode: otp, otpExpiry: otpExpiry() });
      await sendOTPEmail(email, user.name, otp);

      return res.status(403).json({
        error: "Please verify your email before logging in. We've sent a new code to your email.",
        requiresVerification: true,
        email,
      });
    }

    const token = createToken(user.id);
    res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Forgot password — send reset OTP ─────────────────────────────
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) return res.status(400).json({ error: "Email is required." });

    const user = await User.findOne({ where: { email } });

    // Always return success even if email not found — prevents user enumeration
    if (!user) {
      return res.json({ message: "If an account exists with that email, a reset code has been sent." });
    }

    const otp = generateOTP();
    await user.update({ otpCode: otp, otpExpiry: otpExpiry() });
    await sendPasswordResetEmail(email, user.name, otp);

    res.json({ message: "If an account exists with that email, a reset code has been sent.", email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Reset password — verify OTP and set new password ─────────────
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ error: "Email, code, and new password are required." });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ error: "Account not found." });

    if (!user.otpCode || !user.otpExpiry) {
      return res.status(400).json({ error: "No reset code found. Please request a new one." });
    }

    if (new Date() > new Date(user.otpExpiry)) {
      return res.status(400).json({ error: "Reset code has expired. Please request a new one." });
    }

    if (user.otpCode !== otp.trim()) {
      return res.status(400).json({ error: "Incorrect reset code. Please try again." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await user.update({
      password: hashedPassword,
      otpCode: null,
      otpExpiry: null,
    });

    res.json({ message: "Password reset successfully! You can now log in with your new password." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ── Get current user ──────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.userId, {
      attributes: ["id", "name", "email", "createdAt"],
    });
    if (!user) return res.status(404).json({ error: "User not found." });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};