import Payment from '../../models/Payment.js';
import ApiResponse from '../../utils/ApiResponse.js';
import asyncHandler from '../../utils/asyncHandler.js';

export const createPayment = asyncHandler(async (req, res) => {
    const { amount, method, patientId, appointmentId } = req.body;

    const newPayment = await Payment.create({
        amount,
        method: method || null,
        patientId,
        appointmentId: appointmentId || null
    });

    return ApiResponse.success(res, 'Payment created successfully', {
        payment: newPayment,
    }, 201);
});

export const getAllPayments = asyncHandler(async (req, res) => {
    const payments = await Payment.findAll(req.query);
    return ApiResponse.success(res, 'Payments fetched successfully', {
        payments,
    });
});

export const getPaymentById = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payment = await Payment.findById(Number(id));

    if (!payment) {
        return ApiResponse.error(res, 'Payment not found', 404);
    }

    return ApiResponse.success(res, 'Payment details fetched successfully', {
        payment,
    });
});

export const updatePayment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedPayment = await Payment.update(Number(id), updateData);

    return ApiResponse.success(res, 'Payment updated successfully', {
        payment: updatedPayment,
    });
});
