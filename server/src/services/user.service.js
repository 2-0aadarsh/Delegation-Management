import {
  findUserByEmail,
  findUserById,
  createUser,
  getAllUsers,
  updateRole,
  deleteUser,
} from "../models/user.model.js";
import { hashPassword } from "../utils/hash.js";
import { ROLES } from "../constants/roles.js";

export const createSuperAdmin = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  return await createUser({
    name,
    email,
    password: hashedPassword,
    role: ROLES.SUPER_ADMIN,
  });
};

export const createAdmin = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  return await createUser({ name, email, password: hashedPassword, role: ROLES.ADMIN });
};

export const createNormalUser = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);
  return await createUser({ name, email, password: hashedPassword, role: ROLES.USER });
};

export const fetchAllUsers = async () => {
  return await getAllUsers();
};

export const updateUserRole = async (id, role) => {
  const user = await findUserById(id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  await updateRole(id, role);
};

export const removeUser = async (id) => {
  const user = await findUserById(id);
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  await deleteUser(id);
};
