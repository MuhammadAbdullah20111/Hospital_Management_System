import { validationResult } from 'express-validator';
import ApiResponse from '../utils/ApiResponse.js';

export const validate = (rules) => {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) {
        return next();
      }

      const extractedErrors = [];
      errors.array().map((err) => extractedErrors.push({ [err.path]: err.msg }));
      
      const firstErrorMessage = errors.array()[0].msg;

      return ApiResponse.error(res, firstErrorMessage, 422, extractedErrors);
    },
  ];
};

