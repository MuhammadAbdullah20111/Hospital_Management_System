import ApiResponse from '../utils/ApiResponse.js';

export const authorizeRole = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return ApiResponse.error(res, 'Access denied. User not authenticated.', 401);
    }

    if (req.user.role !== requiredRole) {
      return ApiResponse.error(res, 'Access denied. Insufficient permissions.', 403);
    }

    next();
  };
};
