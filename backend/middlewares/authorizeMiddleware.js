import ApiResponse from '../utils/ApiResponse.js';

export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || (roles.length && !roles.some(r => r.toUpperCase() === req.user.role?.toUpperCase()))) {
      return ApiResponse.error(res, 'Access denied. You do not have permission to access this resource.', 403);
    }
    next();
  };
};
