import Shift from '../../models/Shift.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createShift = asyncHandler(async (req, res) => {
  const { name, day, startTime, endTime } = req.body;

  const shift = await Shift.create({
    name,
    day,
    startTime,
    endTime,
  });

  return ApiResponse.success(res, 'Shift created successfully', { shift }, 201);
});

export const getAllShifts = asyncHandler(async (req, res) => {
  const shifts = await Shift.findAll();
  return ApiResponse.success(res, 'Shifts fetched successfully', { shifts });
});

export const getShiftById = asyncHandler(async (req, res) => {
  const shift = await Shift.findById(req.params.id);
  if (!shift) {
    return ApiResponse.error(res, 'Shift not found', 404);
  }
  return ApiResponse.success(res, 'Shift fetched successfully', { shift });
});

export const updateShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const shift = await Shift.findById(id);
  if (!shift) {
    return ApiResponse.error(res, 'Shift not found', 404);
  }

  const updatedShift = await Shift.update(id, req.body);
  return ApiResponse.success(res, 'Shift updated successfully', { shift: updatedShift });
});

export const deleteShift = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const shift = await Shift.findById(id);
  if (!shift) {
    return ApiResponse.error(res, 'Shift not found', 404);
  }

  await Shift.delete(id);
  return ApiResponse.success(res, 'Shift deleted successfully');
});
