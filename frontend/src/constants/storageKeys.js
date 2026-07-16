// Centralized localStorage key names. AuthContext, axiosInstance, and the
// socket connection module all need these, but AuthContext itself imports
// axiosInstance indirectly (via api/authApi.js) - if axiosInstance imported
// the keys back from AuthContext, that would form a circular import. Pulling
// them into their own tiny module avoids that entirely.
export const TOKEN_KEY = "collabboard_token";
export const USER_KEY = "collabboard_user";
