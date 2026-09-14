import { body } from 'express-validator';

export const createPermissionValidation = [
  body('name').notEmpty().withMessage('Permission name is required').isString().withMessage('Permission name must be a string'),
];
