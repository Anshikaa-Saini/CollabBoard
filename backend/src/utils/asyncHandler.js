/**
 * Wraps async route handlers so any thrown/rejected error
 * is automatically forwarded to Express's error handling middleware.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
