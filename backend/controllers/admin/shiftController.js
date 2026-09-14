import Shift from '../../models/Shift.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

const DAYS_MAP = {
  'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3,
  'Friday': 4, 'Saturday': 5, 'Sunday': 6
};

const calculateDurationMinutes = (startDay, endDay, startTime, endTime) => {
  if (!startTime || !endTime || !startDay || !endDay) return 0;
  
  const startParts = startTime.split(':');
  const endParts = endTime.split(':');
  
  if (startParts.length !== 2 || endParts.length !== 2) return 0;

  const [startHours, startMinutes] = startParts.map(Number);
  const [endHours, endMinutes] = endParts.map(Number);
  
  const startIndex = DAYS_MAP[startDay];
  const endIndex = DAYS_MAP[endDay];
  
  if (startIndex === undefined || endIndex === undefined) return 0;

  let dayDiff = endIndex - startIndex;
  if (dayDiff < 0) dayDiff += 7; // Wraps around the week

  const startTotalMinutes = (startIndex * 24 * 60) + (startHours * 60) + startMinutes;
  let endTotalMinutes = (endIndex * 24 * 60) + (endHours * 60) + endMinutes;

  // If end is before start on the same day, or it's wrapped around, we need to handle it.
  // Actually, the dayDiff already handles the day wrapping.
  // We just need to check if end total is less than start total (e.g. Mon 10pm to Mon 8pm next week - which is 6 days 22 hours)
  if (endTotalMinutes <= startTotalMinutes) {
    endTotalMinutes += 7 * 24 * 60; // Add a full week
  }
  
  return endTotalMinutes - startTotalMinutes;
};

export const createShift = asyncHandler(async (req, res) => {
  const { name, departmentId, slots } = req.body;

  const slotsWithDuration = slots.map(slot => ({
    startDayOfWeek: slot.startDayOfWeek,
    endDayOfWeek: slot.endDayOfWeek,
    startTime: slot.startTime,
    endTime: slot.endTime,
    duration: calculateDurationMinutes(slot.startDayOfWeek, slot.endDayOfWeek, slot.startTime, slot.endTime)
  }));

  const shift = await Shift.create({
    name,
    departmentId: departmentId ? parseInt(departmentId) : null,
    slots: {
      create: slotsWithDuration
    }
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
  const { name, departmentId, slots } = req.body;
  
  const shift = await Shift.findById(id);
  if (!shift) {
    return ApiResponse.error(res, 'Shift not found', 404);
  }

  const data = {};
  if (name !== undefined) data.name = name;
  if (departmentId !== undefined) data.departmentId = departmentId ? parseInt(departmentId) : null;
  
  if (slots) {
    data.slots = {
      deleteMany: {},
      create: slots.map(slot => ({
        startDayOfWeek: slot.startDayOfWeek,
        endDayOfWeek: slot.endDayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        duration: calculateDurationMinutes(slot.startDayOfWeek, slot.endDayOfWeek, slot.startTime, slot.endTime)
      }))
    };
  }

  const updatedShift = await Shift.update(id, data);
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
