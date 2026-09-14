import Permission from '../../models/Permission.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const getAllPermissions = asyncHandler(async (req, res) => {
  const permissions = await Permission.findAll();
  return ApiResponse.success(res, 'Permissions fetched successfully', { permissions });
});
