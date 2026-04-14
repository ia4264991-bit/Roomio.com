import express from "express";
import {
  login,
  logout,
  register,
  sendOtp,
  verifyEmail,
  isAuthenticated,
  resetPassword,
  resetPasswordOtp,
} from "../controler/authControlers.js";
import userAuth from "../service/middleware/userAuth.js";

const authRoute = express.Router();

authRoute.post("/register", register);
authRoute.post("/login", login);
authRoute.post("/logout", logout);
authRoute.post("/getotp", userAuth, sendOtp);
authRoute.post("/verifyemail", userAuth, verifyEmail);
authRoute.post("/verityemail", userAuth, verifyEmail);
authRoute.get("/authentication", userAuth, isAuthenticated);
authRoute.post("/resetpasswordotp", resetPasswordOtp);
authRoute.post("/resetpassword", resetPassword);

export default authRoute;