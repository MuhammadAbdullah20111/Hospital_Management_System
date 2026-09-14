import Room from '../../models/Room.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createRoom = asyncHandler(async (req, res) => {
  const { roomNumber, wardId, categoryId, floor } = req.body;
  // Check if roomNumber already exists
  const existingRoom = await prisma.room.findFirst({
    where: { roomNumber, wardId: parseInt(wardId) }
  });
  if (existingRoom) {
    return ApiResponse.error(res, `Room number "${roomNumber}" already exists in this ward`, 400);
  }

  const room = await Room.create({
    roomNumber,
    wardId: parseInt(wardId),
    categoryId: categoryId ? parseInt(categoryId) : null,
    floor: floor ? parseInt(floor) : null,
    isActive: req.body.isActive !== undefined ? req.body.isActive : true
  });
  return ApiResponse.success(res, 'Room created successfully', { room }, 201);
});

export const getAllRooms = asyncHandler(async (req, res) => {
  const { wardId } = req.query;
  const filters = {};
  if (wardId) filters.wardId = parseInt(wardId);

  const rooms = await Room.findAll(filters);
  return ApiResponse.success(res, 'Rooms fetched successfully', { rooms });
});

export const getRoomById = asyncHandler(async (req, res) => {
  const room = await Room.findById(parseInt(req.params.id));
  if (!room) {
    return ApiResponse.error(res, 'Room not found', 404);
  }
  return ApiResponse.success(res, 'Room fetched successfully', { room });
});

export const updateRoom = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (data.wardId) data.wardId = parseInt(data.wardId);
  if (data.categoryId !== undefined) {
    data.categoryId = data.categoryId ? parseInt(data.categoryId) : null;
  }
  if (data.floor !== undefined) {
    data.floor = data.floor ? parseInt(data.floor) : null;
  }
  const room = await Room.update(parseInt(req.params.id), data);
  return ApiResponse.success(res, 'Room updated successfully', { room });
});

export const deleteRoom = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Check for occupied beds in the room
  const occupiedBeds = await prisma.bed.count({
    where: { roomId: id, status: 'OCCUPIED' }
  });
  
  if (occupiedBeds > 0) {
    return ApiResponse.error(res, `Cannot delete room. There are ${occupiedBeds} occupied beds.`, 400);
  }

  await Room.delete(id);
  return ApiResponse.success(res, 'Room deleted successfully');
});

// Room Categories
export const getRoomCategories = asyncHandler(async (req, res) => {
  const categories = await prisma.roomCategory.findMany({
    include: {
      _count: {
        select: { rooms: true }
      }
    }
  });
  return ApiResponse.success(res, 'Room categories retrieved successfully', { data: categories });
});

export const createRoomCategory = asyncHandler(async (req, res) => {
  const category = await prisma.roomCategory.create({ data: req.body });
  return ApiResponse.success(res, 'Room category created successfully', { data: category });
});

export const updateRoomCategory = asyncHandler(async (req, res) => {
  const category = await prisma.roomCategory.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  return ApiResponse.success(res, 'Room category updated successfully', { data: category });
});
