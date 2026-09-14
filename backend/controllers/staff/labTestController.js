import LabTest from '../../models/LabTest.js';
import Payment from '../../models/Payment.js';
import fs from 'fs';
import path from 'path';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createLabTest = asyncHandler(async (req, res) => {
    const { tests, patientId, conductedById, amount, status: globalStatus } = req.body;

    // Support for bulk creation
    if (Array.isArray(tests) && tests.length > 0) {
        const results = await Promise.all(tests.map(async (test) => {
            const newLabTest = await LabTest.create({
                testName: test.testName,
                testId: test.testId ? Number(test.testId) : null,
                status: globalStatus || 'PENDING',
                patientId: Number(patientId),
                conductedById: conductedById ? Number(conductedById) : null,
                createdById: req.user.id
            });

            let newPayment = null;
            if (test.amount && !isNaN(parseFloat(test.amount))) {
                newPayment = await Payment.create({
                    amount: parseFloat(test.amount),
                    method: 'CASH',
                    patientId: Number(patientId),
                    labTestId: newLabTest.id
                });
            }

            return { labTest: newLabTest, payment: newPayment };
        }));

        return ApiResponse.success(res, `${results.length} Lab Tests created successfully`, {
            results,
        }, 201);
    }

    // Single test creation (backward compatibility)
    const { testName, testId, status } = req.body;
    const newLabTest = await LabTest.create({
        testName,
        testId: testId ? Number(testId) : null,
        status: status || 'PENDING',
        patientId: Number(patientId),
        conductedById: conductedById ? Number(conductedById) : null,
        createdById: req.user.id
    });

    let newPayment = null;
    if (amount && !isNaN(parseFloat(amount))) {
        newPayment = await Payment.create({
            amount: parseFloat(amount),
            method: 'CASH',
            patientId: Number(patientId),
            labTestId: newLabTest.id
        });
    }

    return ApiResponse.success(res, 'Lab Test created successfully', {
        labTest: newLabTest,
        payment: newPayment
    }, 201);
});

export const getAllLabTests = asyncHandler(async (req, res) => {
    const labTests = await LabTest.findAll();
    return ApiResponse.success(res, 'Lab Tests fetched successfully', {
        labTests,
    });
});

export const getLabTestById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const labTest = await LabTest.findById(Number(id));

    if (!labTest) {
        return ApiResponse.error(res, 'Lab Test not found', 404);
    }

    return ApiResponse.success(res, 'Lab Test details fetched successfully', {
        labTest,
    });
});

export const updateLabTest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLabTest = await LabTest.update(Number(id), updateData);

    return ApiResponse.success(res, 'Lab Test updated successfully', {
        labTest: updatedLabTest,
    });
});

export const deleteLabTest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await LabTest.delete(Number(id));
    return ApiResponse.success(res, 'Lab Test deleted successfully');
});

export const uploadLabReport = asyncHandler(async (req, res, next) => {
    const { id } = req.params;
    
    if (!req.file) {
        return ApiResponse.error(res, 'No report file provided', 400);
    }
    
    const reportPath = `/uploads/reports/${req.file.filename}`;
    
    try {
        const currentLabTest = await LabTest.findById(Number(id));
        if (!currentLabTest) {
             fs.unlinkSync(req.file.path);
             return ApiResponse.error(res, 'Lab Test not found', 404);
        }

        const updatedLabTest = await LabTest.update(Number(id), {
            reportFile: reportPath,
            status: 'COMPLETED' 
        });
        
        return ApiResponse.success(res, 'Lab report uploaded successfully', {
            labTest: updatedLabTest
        });
    } catch (error) {
        if (req.file && req.file.path && fs.existsSync(req.file.path)) {
             fs.unlinkSync(req.file.path);
        }
        throw error;
    }
});
