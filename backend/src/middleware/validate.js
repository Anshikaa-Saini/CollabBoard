const ApiError = require("../utils/ApiError");

/**
 * Generic middleware factory that validates req.body against
 * a given Zod schema. On failure, forwards a 400 ApiError with
 * a readable list of field issues.
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return next(new ApiError(400, "Validation failed", details));
  }

  req.body = result.data;
  next();
};

module.exports = validate;
