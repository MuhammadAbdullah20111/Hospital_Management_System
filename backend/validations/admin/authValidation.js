import { body } from 'express-validator';

export const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
];

export const resetPasswordValidation = [
  body('otp').isString().withMessage('OTP must be a string').isNumeric().withMessage('OTP must be numeric').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }),
];

export const loginValidation = [
  body('email').isEmail().withMessage('Please provide a valid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const updateProfileValidation = [
  body('name').optional().isString().withMessage('Name must be a string'),
  body('email').optional().isEmail().withMessage('Please provide a valid email address'),
  body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('phoneNumber').notEmpty().withMessage('Phone Number is required').matches(/^03[0-9]{9}$/).withMessage('Must be a valid 11-digit Pakistani phone number starting with 03'),
  body('otp').optional().isString().withMessage('OTP must be a string').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

