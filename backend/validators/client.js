import { body } from 'express-validator';

export const createClientValidation = [
  body('name').trim().notEmpty().withMessage('Client name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('taxId').optional().trim(),
];

export const updateClientValidation = [
  body('name').optional().trim().notEmpty().withMessage('Client name cannot be empty'),
  body('email').optional().isEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('address').optional().trim(),
  body('company').optional().trim(),
  body('city').optional().trim(),
  body('country').optional().trim(),
  body('taxId').optional().trim(),
];