import { body } from 'express-validator';

export const createAppointmentValidation = [
    body('date').isISO8601().toDate().withMessage('Valid date is required'),
    body('time').notEmpty().withMessage('Time is required'),
    body('reason').optional().isString(),
    body('patientId').isInt().withMessage('Valid Patient ID is required'),
    body('doctorId').isInt().withMessage('Valid Doctor ID is required'),
];

export const updateAppointmentValidation = [
    body('date').optional().isISO8601().toDate().withMessage('Valid date is required'),
    body('time').optional().notEmpty().withMessage('Time is required'),
    body('reason').optional().isString(),
    body('status').optional().isIn(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']).withMessage('Invalid status'),
    body('patientId').optional().isInt().withMessage('Valid Patient ID is required'),
    body('doctorId').optional().isInt().withMessage('Valid Doctor ID is required'),
];
