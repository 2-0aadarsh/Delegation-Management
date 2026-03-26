import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
  try {
    // Read the token from the httpOnly cookie set at login/register
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please log in to continue",
      });
    }

    // verifyToken throws if token is invalid or expired
    const decoded = verifyToken(token);

    // Attach decoded payload { id, role, iat, exp } to the request
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Session expired or invalid. Please log in again.",
    });
  }
};
