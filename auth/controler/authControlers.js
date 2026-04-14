import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userModule from "../models/userModule.js";
import transporter from "../models/nodeMailer.js";

dotenv.config();
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || "").trim().toLowerCase();

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req, res) => {
  const { name, email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!name || !normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: "missing details" });
  }

  try {
    const existingUser = await userModule.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ success: false, message: "user already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const role = ADMIN_EMAIL && normalizedEmail === ADMIN_EMAIL ? "admin" : "user";
    const user = new userModule({ name, email: normalizedEmail, password: hashedPassword, role });
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);

    if (ADMIN_EMAIL && user.role !== "admin" && user.email === ADMIN_EMAIL) {
      user.role = "admin";
      await user.save();
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();

  if (!normalizedEmail || !password) {
    return res.status(400).json({ success: false, message: "missing details" });
  }

  try {
    const user = await userModule.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "invalid email or password" });
    }

    const checkPassword = await bcrypt.compare(password, user.password);
    if (!checkPassword) {
      return res.status(401).json({ success: false, message: "invalid email or password" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    setAuthCookie(res, token);

    if (ADMIN_EMAIL && user.role !== "admin" && normalizedEmail === ADMIN_EMAIL) {
      user.role = "admin";
      await user.save();
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (_req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });
    return res.json({ success: true, message: "logged out" });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "failed connection" });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const user = await userModule.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    if (user.isAccountVerify) {
      return res.json({ success: false, message: "account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Account verification OTP",
      text: `Your account verification OTP is: ${otp}`,
    });

    return res.json({ success: true, message: "verification otp sent to email" });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "verification failed" });
  }
};

export const verifyEmail = async (req, res) => {
  const { otp } = req.body;
  if (!otp) {
    return res.status(400).json({ success: false, message: "missing details" });
  }
  try {
    const user = await userModule.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    if (!user.verifyOtp || user.verifyOtp !== otp) {
      return res.status(400).json({ success: false, message: "invalid otp" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.status(400).json({ success: false, message: "otp expired" });
    }

    user.isAccountVerify = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();

    return res.json({ success: true, message: "email verified successfully" });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "invalid credentials" });
  }
};

export const isAuthenticated = async (req, res) => {
  try {
    const user = await userModule.findById(req.userId).select("name email isAccountVerify role");
    if (!user) {
      return res.status(404).json({ success: false, message: "user not found" });
    }
    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
        verification: user.isAccountVerify,
      },
    });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "invalid credentials" });
  }
};

export const resetPasswordOtp = async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(400).json({ success: false, message: "email is required" });
  }

  try {
    const user = await userModule.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "invalid email" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: user.email,
      subject: "Reset account password OTP",
      text: `Your reset account password OTP is: ${otp}`,
    });

    user.resetOtp = otp;
    user.resetOtpExpiredAt = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.json({ success: true, message: "otp sent to email" });
  } catch (_error) {
    return res.status(500).json({ success: false, message: "invalid credentials" });
  }
};

export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "missing details" });
    }

    const user = await userModule.findOne({ email: String(email).trim().toLowerCase() });
    if (!user) {
      return res.status(404).json({ success: false, message: "invalid email" });
    }

    if (!user.resetOtp || user.resetOtp !== otp || user.resetOtpExpiredAt < Date.now()) {
      return res.status(400).json({ success: false, message: "invalid or expired otp" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpiredAt = 0;
    await user.save();

    return res.json({ success: true, message: "password reset successfully" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
