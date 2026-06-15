import { body } from 'express-validator';

// Bank creation validation
export const createBankValidation = [
  body('bankName')
    .notEmpty()
    .withMessage('Bank name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),
  
  body('accountName')
    .notEmpty()
    .withMessage('Account name is required')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account name must be between 2 and 100 characters'),
  
  body('accountNumber')
    .notEmpty()
    .withMessage('Account number is required')
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Nigerian account number must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Account number must contain only digits'),
  
  body('bankAddress')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bank address must not exceed 200 characters'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
];

// Bank update validation
export const updateBankValidation = [
  body('bankName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Bank name must be between 2 and 100 characters'),
  
  body('accountName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Account name must be between 2 and 100 characters'),
  
  body('accountNumber')
    .optional()
    .trim()
    .isLength({ min: 10, max: 10 })
    .withMessage('Nigerian account number must be exactly 10 digits')
    .matches(/^[0-9]+$/)
    .withMessage('Account number must contain only digits'),
  
  body('bankAddress')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Bank address must not exceed 200 characters'),
  
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
];