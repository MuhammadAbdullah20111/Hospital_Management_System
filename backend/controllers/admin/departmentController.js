import Department from '../../models/Department.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createDepartment = asyncHandler(async (req, res) => {
  const department = await Department.create(req.body);
  return ApiResponse.success(res, 'Department created successfully', { department }, 201);
});

export const getAllDepartments = asyncHandler(async (req, res) => {
  const departments = await Department.findAll();
  return ApiResponse.success(res, 'Departments fetched successfully', { departments });
});

export const getDepartmentById = asyncHandler(async (req, res) => {
  const department = await Department.findById(req.params.id);
  if (!department) {
    return ApiResponse.error(res, 'Department not found', 404);
  }
  return ApiResponse.success(res, 'Department fetched successfully', { department });
});

export const updateDepartment = asyncHandler(async (req, res) => {
  const department = await Department.update(req.params.id, req.body);
  return ApiResponse.success(res, 'Department updated successfully', { department });
});

export const deleteDepartment = asyncHandler(async (req, res) => {
  await Department.delete(req.params.id);
  return ApiResponse.success(res, 'Department deleted successfully');
});
