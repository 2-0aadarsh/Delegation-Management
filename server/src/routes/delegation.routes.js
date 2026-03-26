import express from "express";
import {
  createDelegationController,
  getDelegationsController,
  getRecentDelegationsController,
  updateDelegationStatusController,
  deleteDelegationController,
} from "../controllers/delegation.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/role.middleware.js";
import {
  validateCreateDelegation,
  validateUpdateStatus,
} from "../middlewares/validate.middleware.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.post(
  "/create",
  authenticate,
  authorizeRoles(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateCreateDelegation,
  createDelegationController
);

router.get(
  "/",
  authenticate,
  authorizeRoles(ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getDelegationsController
);

router.get(
  "/recent",
  authenticate,
  authorizeRoles(ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getRecentDelegationsController
);

router.put(
  "/:id/status",
  authenticate,
  authorizeRoles(ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN),
  validateUpdateStatus,
  updateDelegationStatusController
);

router.delete(
  "/:id",
  authenticate,
  authorizeRoles(ROLES.SUPER_ADMIN),
  deleteDelegationController
);

export default router;
