import Test from '../../models/Test.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createTest = asyncHandler(async (req, res) => {
    const { name, category, price, isActive } = req.body;
    const newTest = await Test.create({
        name,
        category,
        price: price ? parseFloat(price) : 0,
        isActive: isActive !== undefined ? isActive : true,
    });

    return ApiResponse.success(res, 'Test created successfully', { test: newTest }, 201);
});

export const getAllTests = asyncHandler(async (req, res) => {
    const tests = await Test.findAll();
    return ApiResponse.success(res, 'Tests retrieved successfully', { tests });
});

export const getTestById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const test = await Test.findById(Number(id));
    if (!test) {
        return ApiResponse.error(res, 'Test not found', 404);
    }
    return ApiResponse.success(res, 'Test retrieved successfully', { test });
});

export const updateTest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { name, category, price, isActive } = req.body;
    
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedTest = await Test.update(Number(id), updateData);
    return ApiResponse.success(res, 'Test updated successfully', { test: updatedTest });
});

export const deleteTest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await Test.delete(Number(id));
    return ApiResponse.success(res, 'Test deleted successfully');
});
