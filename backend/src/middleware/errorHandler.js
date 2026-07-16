const ApiError = require("../utils/ApiError");

/**
 * Catches 404s for any route not matched above this middleware.
 */
const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found - ${req.originalUrl}`));
};

/**
 * Centralized error handler. Must be registered LAST in the
 * middleware chain (after all routes).
 */
// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let details = err.details || null;

  // Malformed JSON body (e.g. a client sends invalid JSON) - body-parser
  // marks this with a `type` of 'entity.parse.failed' rather than a
  // Mongoose-style error name.
  if (err.type === "entity.parse.failed") {
    statusCode = 400;
    message = "Invalid JSON in request body";
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose duplicate key (e.g. email already registered)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field ? field.charAt(0).toUpperCase() + field.slice(1) : "Field"} already in use`;
  }

  // Mongoose schema validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    message = "Validation failed";
  }

  if (process.env.NODE_ENV !== "production") {
    console.error(err);
  }

  // In production, don't leak internal error details for unclassified 500s
  // (the real message is still logged above). ApiError instances set
  // isOperational = true, meaning "this was thrown intentionally with a
  // safe, specific message" - anything else is treated as an unexpected
  // bug and gets a generic message instead.
  if (statusCode === 500 && process.env.NODE_ENV === "production" && !err.isOperational) {
    message = "Something went wrong. Please try again later.";
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};

module.exports = { notFound, errorHandler };
