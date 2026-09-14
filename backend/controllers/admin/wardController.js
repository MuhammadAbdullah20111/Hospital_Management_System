import Ward from '../../models/Ward.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import { body, validationResult } from 'express-validator';
import asyncHandler from '../../utils/asyncHandler.js';

export const createWard = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return ApiResponse.error(res, 'Validation failed', 400, errors.array());
  }

  const { name, code } = req.body;
  const existingCode = await Ward.findByCode(code);
  if (existingCode) {
    return ApiResponse.error(res, `Ward with code "${code}" already exists`, 400);
  }

  const existingName = await prisma.ward.findFirst({ where: { name } });
  if (existingName) {
    return ApiResponse.error(res, `Ward with name "${name}" already exists`, 400);
  }

  const ward = await Ward.create(req.body);
  return ApiResponse.success(res, 'Ward created successfully', { ward }, 201);
});

export const getAllWards = asyncHandler(async (req, res) => {
  const wards = await Ward.findAll();
  return ApiResponse.success(res, 'Wards fetched successfully', { wards });
});

export const getWardById = asyncHandler(async (req, res) => {
  const ward = await Ward.findById(parseInt(req.params.id));
  if (!ward) {
    return ApiResponse.error(res, 'Ward not found', 404);
  }
  return ApiResponse.success(res, 'Ward fetched successfully', { ward });
});

export const updateWard = asyncHandler(async (req, res) => {
  const ward = await Ward.update(parseInt(req.params.id), req.body);
  return ApiResponse.success(res, 'Ward updated successfully', { ward });
});

export const deleteWard = asyncHandler(async (req, res) => {
  const id = parseInt(req.params.id);
  
  // Check for occupied beds in the ward
  const occupiedBeds = await prisma.bed.count({
    where: { wardId: id, status: 'OCCUPIED' }
  });
  
  if (occupiedBeds > 0) {
    return ApiResponse.error(res, `Cannot delete ward. There are ${occupiedBeds} occupied beds.`, 400);
  }

  await Ward.delete(id);
  return ApiResponse.success(res, 'Ward deleted successfully');
});
