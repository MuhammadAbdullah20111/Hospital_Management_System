import { body } from 'express-validator';

export const createShiftValidation = [
  body('name').notEmpty().withMessage('Name is required'),
  body('departmentId').optional({ nullable: true }).isInt().withMessage('Invalid department ID'),
  body('slots').isArray({ min: 1 }).withMessage('At least one shift slot is required'),
  body('slots.*.startDayOfWeek').notEmpty().withMessage('Start day is required'),
  body('slots.*.endDayOfWeek').notEmpty().withMessage('End day is required'),
  body('slots.*.startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time (HH:mm) is required'),
  body('slots.*.endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid end time (HH:mm) is required'),
];

export const updateShiftValidation = [
  body('name').optional().notEmpty().withMessage('Name cannot be empty'),
  body('departmentId').optional({ nullable: true }).isInt().withMessage('Invalid department ID'),
  body('slots').optional().isArray({ min: 1 }).withMessage('At least one shift slot is required'),
  body('slots.*.startDayOfWeek').notEmpty().withMessage('Start day is required'),
  body('slots.*.endDayOfWeek').notEmpty().withMessage('End day is required'),
  body('slots.*.startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid start time (HH:mm) is required'),
  body('slots.*.endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Valid end time (HH:mm) is required'),
];
