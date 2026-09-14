import ApiResponse from '../utils/ApiResponse.js';
import prisma from '../config/prismaClient.js';

export const checkPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || (!req.user.id && req.user.userType !== 'SYSTEM_ADMIN')) {
        return ApiResponse.error(res, 'Access denied. User not authenticated.', 401);
      }

      // Bypass permissions check for main system admin
      if (req.user.userType === 'SYSTEM_ADMIN') {
        return next();
      }

      const permissionArray = Array.isArray(permissions) ? permissions : [permissions];

      const staff = await prisma.staff.findUnique({
        where: { id: req.user.id },
        select: {
          role: {
            select: {
              rolePermissions: {
                select: {
                  permission: {
                    select: {
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      if (!staff || !staff.role) {
        return ApiResponse.error(res, 'Access denied. Staff or role not found.', 403);
      }

      // Check if the user has AT LEAST ONE of the required permissions
      const hasPermission = staff.role.rolePermissions.some(
        (rp) => permissionArray.includes(rp.permission.name)
      );

      if (!hasPermission) {
        return ApiResponse.error(res, 'Access denied. You do not have permission to access this resource.', 403);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
