import { findUserByEmail, createUser } from "../models/user.model.js";
import { hashPassword, comparePassword } from "../utils/hash.js";
import { ROLES } from "../constants/roles.js";

// Register — always creates a plain "user". Role escalation is not allowed here.
export const registerUserService = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const err = new Error("An account with this email already exists");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await createUser({
    name,
    email,
    password: hashedPassword,
    role: ROLES.USER, // Role is always "user" on self-registration — never from request body
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
  };
};

// Login — validates credentials and returns the user object
export const loginUserService = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const err = new Error("Invalid email");
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const err = new Error("Invalid password");
    err.statusCode = 401;
    throw err;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
