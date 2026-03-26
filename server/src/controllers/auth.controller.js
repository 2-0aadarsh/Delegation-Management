import { registerUserService, loginUserService } from "../services/auth.service.js";
import { createSuperAdmin } from "../services/user.service.js";
import { generateToken } from "../utils/jwt.js";
import { logActivity } from "../models/activity.model.js";
import { findUserById } from "../models/user.model.js";

// Cookie configuration — httpOnly prevents JS access, secure in production only
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: 24 * 60 * 60 * 1000, // 1 day in ms — mirrors JWT_EXPIRES
};

const setTokenCookie = (res, user) => {
  const token = generateToken(user);
  res.cookie("token", token, COOKIE_OPTIONS);
};

// POST /api/auth/bootstrap-superadmin — open bootstrap (lock down / remove in real production)
export const bootstrapSuperAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const user = await createSuperAdmin({ name, email, password });
    await logActivity(user.id, `Bootstrap: super admin created for ${email}`);
    return res.status(201).json({
      success: true,
      message: "Super admin created successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/register
export const registerUser = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const user = await registerUserService({ name, email, password });

    setTokenCookie(res, user);
    await logActivity(user.id, "Registered a new account");

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      data: user,
    });
  } catch (error) {
    next(error); // Passes to the global error handler — server never crashes
  }
};

// POST /api/auth/login
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await loginUserService({ email, password });

    setTokenCookie(res, user);
    await logActivity(user.id, "Logged in");

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: user, // Consistent: always "data", never "user" at root level
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/logout
export const logoutUser = (req, res, next) => {
  try {
    // Clearing the cookie is the entire logout mechanism — no server-side session to destroy
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    // Log the activity if we know the user (token was still valid when they hit logout)
    if (req.user?.id) {
      logActivity(req.user.id, "Logged out"); // fire-and-forget
    }

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me — full profile from DB (JWT payload is only { id, role })
export const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
