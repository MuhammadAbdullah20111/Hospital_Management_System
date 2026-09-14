import { verifyToken } from '../utils/jwtHelper.js';
import ApiResponse from '../utils/ApiResponse.js';

export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Access denied. No token provided.', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return ApiResponse.error(res, 'Invalid or expired token.', 401);
  }
};
