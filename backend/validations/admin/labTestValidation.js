import { body } from 'express-validator';

export const createLabTestValidation = [
    body('patientId').isInt().withMessage('Valid Patient ID is required'),
    body('conductedById').optional().isInt().withMessage('Valid Staff ID is required'),
    body('testName').if(body('tests').not().exists()).notEmpty().withMessage('Test Name is required if tests array is not provided'),
    body('tests').if(body('testName').not().exists()).isArray({ min: 1 }).withMessage('Tests array is required if test name is not provided'),
];

export const updateLabTestValidation = [
    body('testName').optional().notEmpty().withMessage('Test Name is required'),
    body('result').optional().isString(),
    body('status').optional().isIn(['PENDING', 'COMPLETED']).withMessage('Invalid status'),
    body('patientId').optional().isInt().withMessage('Valid Patient ID is required'),
    body('conductedById').optional().isInt().withMessage('Valid Staff ID is required'),
];
