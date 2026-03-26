import { ROLES } from "../constants/roles.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_STATUSES = ["pending", "in-progress", "completed"];

// Sends a 400 if any field fails — does NOT crash the server
const fail = (res, message) =>
  res.status(400).json({ success: false, message });

export const validateRegister = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2)
    return fail(res, "Name must be at least 2 characters");
  if (!email || !EMAIL_REGEX.test(email))
    return fail(res, "A valid email address is required");
  if (!password || password.length < 6)
    return fail(res, "Password must be at least 6 characters");

  next();
};

export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !EMAIL_REGEX.test(email))
    return fail(res, "A valid email address is required");
  if (!password)
    return fail(res, "Password is required");

  next();
};

export const validateCreateUser = (req, res, next) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2)
    return fail(res, "Name must be at least 2 characters");
  if (!email || !EMAIL_REGEX.test(email))
    return fail(res, "A valid email address is required");
  if (!password || password.length < 6)
    return fail(res, "Password must be at least 6 characters");

  next();
};

export const validateCreateDelegation = (req, res, next) => {
  const { title, assigned_to } = req.body;

  if (!title || title.trim().length === 0)
    return fail(res, "Delegation title is required");
  if (!assigned_to || isNaN(Number(assigned_to)))
    return fail(res, "A valid assigned_to user ID is required");

  next();
};

export const validateUpdateStatus = (req, res, next) => {
  const { status } = req.body;

  if (!status || !ALLOWED_STATUSES.includes(status))
    return fail(
      res,
      `Status must be one of: ${ALLOWED_STATUSES.join(", ")}`
    );

  next();
};

export const validateUpdateRole = (req, res, next) => {
  const { role } = req.body;
  const allowedRoles = [ROLES.ADMIN, ROLES.USER];

  if (!role || !allowedRoles.includes(role))
    return fail(res, `Role must be one of: ${allowedRoles.join(", ")}`);

  next();
};
