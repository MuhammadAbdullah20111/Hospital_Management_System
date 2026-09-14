import { body } from 'express-validator';

export const createStaffValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required').matches(/^03[0-9]{9}$/).withMessage('Must be a valid 11-digit Pakistani phone number starting with 03'),
  body('roleId').isInt().withMessage('Valid Role ID is required'),
  body('shiftId').notEmpty().withMessage('Valid Shift ID is required').isInt(),
  body('departmentId').optional({ nullable: true }).isInt().withMessage('Valid Department ID is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('biometricPin').notEmpty().withMessage('Biometric PIN is required').isString().withMessage('Biometric PIN must be a string').matches(/^[0-9]+$/).withMessage('Biometric PIN must contain only numbers'),
];

export const updateStaffValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required').matches(/^03[0-9]{9}$/).withMessage('Must be a valid 11-digit Pakistani phone number starting with 03'),
  body('roleId').optional().isInt().withMessage('Valid Role ID is required'),
  body('shiftId').notEmpty().withMessage('Valid Shift ID is required').isInt(),
  body('departmentId').optional({ nullable: true }).isInt().withMessage('Valid Department ID is required'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
  body('biometricPin').notEmpty().withMessage('Biometric PIN is required').isString().withMessage('Biometric PIN must be a string').matches(/^[0-9]+$/).withMessage('Biometric PIN must contain only numbers'),
];

export const loginStaffValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
];

export const resetPasswordValidation = [
  body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 characters'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];
