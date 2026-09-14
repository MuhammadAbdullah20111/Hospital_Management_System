import { body } from 'express-validator';

export const createServiceValidation = [
  body('name').notEmpty().withMessage('Service name is required').isString(),
  body('category').optional().isString(),
  body('specialty').optional().isString(),
  body('description').optional().isString(),
  body('shortDescription').optional().isString(),
  body('image').optional().isString(),
  body('imageAlt').optional().isString(),
  body('icon').optional().isString(),
  body('isActive').optional().toBoolean(),
  body('baseCost').optional().toFloat(),
  body('successRate').optional().toFloat(),
  body('rating').optional().toFloat(),
  body('patientsServed').optional().toInt(),
  body('features').optional().customSanitizer(value => {
    if (typeof value === 'string') {
      return value.split(',').map(f => f.trim()).filter(f => f !== '');
    }
    return value;
  }),
];

export const updateServiceValidation = [
  body('name').optional().notEmpty().withMessage('Service name cannot be empty').isString(),
  body('category').optional().isString(),
  body('specialty').optional().isString(),
  body('description').optional().isString(),
  body('shortDescription').optional().isString(),
  body('image').optional().isString(),
  body('imageAlt').optional().isString(),
  body('icon').optional().isString(),
  body('isActive').optional().toBoolean(),
  body('baseCost').optional().toFloat(),
  body('successRate').optional().toFloat(),
  body('rating').optional().toFloat(),
  body('patientsServed').optional().toInt(),
  body('features').optional().customSanitizer(value => {
    if (typeof value === 'string') {
      return value.split(',').map(f => f.trim()).filter(f => f !== '');
    }
    return value;
  }),
];
