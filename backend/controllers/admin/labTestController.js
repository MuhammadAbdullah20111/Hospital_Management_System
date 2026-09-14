import LabTest from '../../models/LabTest.js';
import ApiResponse from '../../utils/ApiResponse.js';
import prisma from '../../config/prismaClient.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createLabTest = asyncHandler(async (req, res) => {
    const { tests, patientId, conductedById, status: globalStatus } = req.body;

    // Support for bulk creation
    if (Array.isArray(tests) && tests.length > 0) {
        const createdTests = await Promise.all(tests.map(test => 
            LabTest.create({
                testName: test.testName,
                testId: test.testId ? Number(test.testId) : null,
                status: globalStatus || 'PENDING',
                patientId: Number(patientId),
                conductedById: conductedById ? Number(conductedById) : null,
                createdById: req.user?.role !== 'ADMIN' ? req.user?.id : undefined
            })
        ));

        return ApiResponse.success(res, `${createdTests.length} Lab Tests created successfully`, {
            labTests: createdTests,
        }, 201);
    }

    // Backward compatibility for single test
    const { testName, testId, status } = req.body;
    const newLabTest = await LabTest.create({
        testName,
        testId: testId ? Number(testId) : null,
        status: status || 'PENDING',
        patientId: Number(patientId),
        conductedById: conductedById ? Number(conductedById) : null,
        createdById: req.user?.role !== 'ADMIN' ? req.user?.id : undefined
    });

    return ApiResponse.success(res, 'Lab Test created successfully', {
        labTest: newLabTest,
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

    // If lab test is completed, create a transaction
    if (updateData.status === 'COMPLETED') {
        try {
            const labTestFull = await LabTest.findById(Number(id));
            const price = labTestFull.test?.price || 0;

            // Check if a transaction for this lab test already exists
            const existingTx = await prisma.transaction.findUnique({
                where: { labTestId: labTestFull.id }
            });

            if (!existingTx) {
                // Find 'Lab Test' category
                const categories = await prisma.transactionCategory.findMany({ where: { name: 'Lab Test' } });
                const categoryId = categories[0]?.id || 1;

                const paymentStatus = req.body.paymentStatus || 'PENDING';
                const paymentMethod = req.body.paymentMethod || 'CASH';
                const paymentReference = req.body.paymentReference || null;

                await prisma.transaction.create({
                    data: {
                        type: 'INCOME',
                        categoryId: categoryId,
                        amount: price,
                        method: paymentMethod,
                        status: paymentStatus,
                        referenceNumber: paymentReference,
                        patientId: labTestFull.patientId,
                        labTestId: labTestFull.id,
                        notes: `Lab Test fee for ${labTestFull.testName} (Test ID: ${labTestFull.id})`
                    }
                });
            }
        } catch (transError) {
            console.error("Failed to create transaction for completed lab test (non-blocking):", transError);
        }
    }

    return ApiResponse.success(res, 'Lab Test updated successfully', {
        labTest: updatedLabTest,
    });
});

export const deleteLabTest = asyncHandler(async (req, res) => {
    const { id } = req.params;
    await LabTest.delete(Number(id));
    return ApiResponse.success(res, 'Lab Test deleted successfully');
});
