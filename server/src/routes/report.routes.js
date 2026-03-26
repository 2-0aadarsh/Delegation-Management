import express from "express";
import { getReportsController } from "../controllers/report.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";

const router = express.Router();

// 📊 Reports Route
router.get(
  "/",
  authenticate,
  authorizeRoles("user", "admin", "superadmin"),
  getReportsController
);

export default router;