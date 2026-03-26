// Global error-handling middleware — must have 4 params for Express to treat it as an error handler
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Only expose stack trace in development so production stays clean
  const response = {
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  return res.status(statusCode).json(response);
};

// Convenience helper to create structured errors with a status code.
// Usage: throw createError(404, "User not found")
export const createError = (statusCode, message) => {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
};
