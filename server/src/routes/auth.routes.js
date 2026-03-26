import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  bootstrapSuperAdmin,
} from "../controllers/auth.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
} from "../middlewares/validate.middleware.js";

const router = express.Router();

router.post(
  "/bootstrap-superadmin",
  validateRegister,
  bootstrapSuperAdmin
);

router.post("/register", validateRegister, registerUser);
router.post("/login", validateLogin, loginUser);
router.post("/logout", authenticate, logoutUser); // Authenticate first so we can log who logged out
router.get("/me", authenticate, getMe);           // Handy for the frontend to rehydrate auth state

export default router;
