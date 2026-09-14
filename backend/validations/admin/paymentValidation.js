import { body } from 'express-validator';

export const createPaymentValidation = [
    body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('method').optional().isIn(['CASH', 'CARD', 'ONLINE']).withMessage('Invalid payment method'),
    body('patientId').isInt().withMessage('Valid Patient ID is required'),
    body('appointmentId').optional().isInt().withMessage('Valid Appointment ID is required'),
];

export const updatePaymentValidation = [
    body('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
    body('method').optional().isIn(['CASH', 'CARD', 'ONLINE']).withMessage('Invalid payment method'),
    body('patientId').optional().isInt().withMessage('Valid Patient ID is required'),
    body('appointmentId').optional().isInt().withMessage('Valid Appointment ID is required'),
];
