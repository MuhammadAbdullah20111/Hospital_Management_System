import Service from '../../models/Service.js';
import ApiResponse from '../../utils/ApiResponse.js';
import fs from 'fs';
import path from 'path';
import asyncHandler from '../../utils/asyncHandler.js';

export const createService = asyncHandler(async (req, res) => {
  const data = { ...req.body };
  if (req.file) {
    data.image = `/uploads/services/${req.file.filename}`;
  }
  const service = await Service.create(data);
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
  const data = { ...req.body };
  
  // Handle new file upload
  if (req.file) {
    const existingService = await Service.findById(req.params.id);
    
    // Delete old image if it exists and is not a URL
    if (existingService && existingService.image && existingService.image.startsWith('/uploads/')) {
      const oldImagePath = path.join(process.cwd(), existingService.image);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    
    data.image = `/uploads/services/${req.file.filename}`;
  }

  const service = await Service.update(req.params.id, data);
  return ApiResponse.success(res, 'Service updated successfully', { service });
});

export const deleteService = asyncHandler(async (req, res) => {
  const service = await Service.findById(req.params.id);
  if (service && service.image && service.image.startsWith('/uploads/')) {
    const imagePath = path.join(process.cwd(), service.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
  }
  await Service.delete(req.params.id);
  return ApiResponse.success(res, 'Service deleted successfully');
});
