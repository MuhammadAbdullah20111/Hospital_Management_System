import Service from '../../models/Service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createService = asyncHandler(async (req, res) => {
  const service = await Service.create(req.body);
  return ApiResponse.success(res, 'Service created successfully', { service }, 201);
});

export const getAllServicesAdmin = asyncHandler(async (req, res) => {
  const services = await Service.findAll();
  return ApiResponse.success(res, 'Services fetched successfully', { services });
});

export const getServiceById = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return ApiResponse.error(res, 'Service not found', 404);
  }
  return ApiResponse.success(res, 'Service fetched successfully', { service });
});

export const updateService = asyncHandler(async (req, res) => {
  const service = await Service.update(req.params.id, req.body);
  return ApiResponse.success(res, 'Service updated successfully', { service });
});

export const deleteService = asyncHandler(async (req, res) => {
  await Service.delete(req.params.id);
  return ApiResponse.success(res, 'Service deleted successfully');
});
