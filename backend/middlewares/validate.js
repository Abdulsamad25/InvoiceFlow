import { validationResult } from 'express-validator';

export const validate = (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    next();
  } catch (error) {
    console.error('VALIDATE MIDDLEWARE ERROR:', error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};