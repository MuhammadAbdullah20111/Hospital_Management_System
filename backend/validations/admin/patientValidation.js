import { body } from 'express-validator';

export const createPatientValidation = [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phoneNumber').notEmpty().withMessage('Phone Number is required').matches(/^03[0-9]{9}$/).withMessage('Must be a valid 11-digit Pakistani phone number starting with 03'),
    body('cnic').notEmpty().withMessage('CNIC (Identity Card) is required').matches(/^\d{13}$/).withMessage('CNIC must be exactly 13 digits'),
    body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('address').optional().isString(),
];

export const updatePatientValidation = [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('phoneNumber').notEmpty().withMessage('Phone Number is required').matches(/^03[0-9]{9}$/).withMessage('Must be a valid 11-digit Pakistani phone number starting with 03'),
    body('cnic').optional().matches(/^\d{13}$/).withMessage('CNIC must be exactly 13 digits'),
    body('age').optional().isInt({ min: 0 }).withMessage('Age must be a positive integer'),
    body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
    body('address').optional().isString(),
];
