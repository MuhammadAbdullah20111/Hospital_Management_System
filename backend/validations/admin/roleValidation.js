import { body } from 'express-validator';

export const createRoleValidation = [
  body('name').notEmpty().withMessage('Role name is required').isString().withMessage('Role name must be a string'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array of IDs'),
  body('permissions.*').isInt().withMessage('Each permission ID must be an integer'),
];

export const updateRoleValidation = [
  body('name').optional().notEmpty().withMessage('Role name cannot be empty').isString().withMessage('Role name must be a string'),
  body('permissions').optional().isArray().withMessage('Permissions must be an array of IDs'),
  body('permissions.*').isInt().withMessage('Each permission ID must be an integer'),
];
