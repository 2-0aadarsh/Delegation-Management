import dotenv from "dotenv";
dotenv.config();
import jwt from "jsonwebtoken";


// Generate Token
export const generateToken = (user) => {
  try {
    const payload = {
      id: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES || "1d",
    });

    return token;
  } catch (error) {
    throw new Error("Error generating token");
  }
};

// Verify Token
export const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};