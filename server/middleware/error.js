// 1. Handle Undefined Routes

export const notFound = (req, res) => {
  return res.status(404).json({
    message: `Route ${req.originalUrl} not found`,
  });
};

// 2. Centralized Error Handler

export const errorHandler = (err, req, res, next) => {
  let status = res.statusCode >= 400 ? res.statusCode : 500;
  let message = err.message;

  // Mongoose Validation Error
  if (err.name === "ValidationError") {
    status = 400;

    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(", ");
  }

  // Invalid MongoDB ObjectId
  if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  }

  // MongoDB Duplicate Key Error
  if (err.code === 11000) {
    status = 409;

    message = err.keyPattern?.email
      ? "Email already registered"
      : "That time slot was just taken, pick another";
  }

  // Send Error Response
  res.status(status).json({
    message,
  });
};
