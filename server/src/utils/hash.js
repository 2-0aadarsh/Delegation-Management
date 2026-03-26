import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

// Hash Password
export const hashPassword = async (plainPassword) => {
  try {
    const hashed = await bcrypt.hash(plainPassword, SALT_ROUNDS);
    return hashed;
  } catch (error) {
    throw new Error("Error hashing password");
  }
};

// Compare Password
export const comparePassword = async (plainPassword, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  } catch (error) {
    throw new Error("Error comparing password");
  }
};