const mongoose = require("mongoose");
const ApiError = require("../utils/ApiError");

/**
 * Validates that one or more route params are well-formed Mongo ObjectIds
 * before hitting the database. Without this, a malformed id (e.g. "abc")
 * still reaches Mongoose, which throws a CastError that the centralized
 * error handler catches anyway - this just produces a cleaner, earlier 400
 * with a clearer message instead of relying on that fallback.
 *
 * Usage: router.get("/:id", validateObjectId("id"), controllerFn)
 */
const validateObjectId = (...paramNames) => (req, res, next) => {
  for (const param of paramNames) {
    const value = req.params[param];
    if (value && !mongoose.Types.ObjectId.isValid(value)) {
      return next(new ApiError(400, `Invalid ${param}: ${value}`));
    }
  }
  next();
};

module.exports = validateObjectId;
