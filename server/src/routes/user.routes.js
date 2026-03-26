import express from "express";
import {
  createAdminController,
  createUserController,
  getAllUsersController,
  updateUserRoleController,
  deleteUserController,
} from "../controllers/user.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  validateCreateUser,
  validateUpdateRole,
} from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/create-admin",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateCreateUser,
  createAdminController
);

router.post(
  "/create-user",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateCreateUser,
  createUserController
);

router.get(
  "/all-users",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getAllUsersController
);

router.patch(
  "/:id/role",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  validateUpdateRole,
  updateUserRoleController
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteUserController
);

export default router;
