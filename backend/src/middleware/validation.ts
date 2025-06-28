// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import { body, query, param, validationResult } from 'express-validator';

// The key fix: explicitly declare this function returns void
export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    
    // Prioritize password and email errors for better user experience
    const passwordError = errorMessages.find(msg => msg.toLowerCase().includes('password'));
    const emailError = errorMessages.find(msg => msg.toLowerCase().includes('email'));
    
    const primaryError = passwordError || emailError || errorMessages[0];
    
    res.status(400).json({
      success: false,
      message: primaryError,
      errors: errorMessages
    });
    return;
  }
  
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and must be less than 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and must be less than 50 characters'),
  body('role')
    .optional()
    .isIn(['client', 'expert'])
    .withMessage('Role must be either client or expert'),
  handleValidationErrors
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors
];

// Expert validation rules
export const validateExpertProfile = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required and must be less than 100 characters'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('location')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Location is required'),
  body('timezone')
    .notEmpty()
    .withMessage('Timezone is required'),
  body('hourlyRate.min')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Minimum hourly rate must be a positive number'),
  body('hourlyRate.max')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Maximum hourly rate must be a positive number'),
  body('bio')
    .trim()
    .isLength({ min: 50, max: 1000 })
    .withMessage('Bio must be between 50 and 1000 characters'),
  body('specialties')
    .isArray({ min: 1 })
    .withMessage('At least one specialty is required'),
  body('industries')
    .isArray({ min: 1 })
    .withMessage('At least one industry is required'),
  body('experience')
    .notEmpty()
    .withMessage('Experience is required'),
  handleValidationErrors
];

// Project validation rules
export const validateProject = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title is required and must be less than 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('budget.total')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number'),
  body('startDate')
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  body('expertId')
    .notEmpty()
    .withMessage('Expert ID is required'),
  handleValidationErrors
];

// Review validation rules
export const validateReview = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('aspects.communication')
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('aspects.quality')
    .isInt({ min: 1, max: 5 })
    .withMessage('Quality rating must be between 1 and 5'),
  body('aspects.timeliness')
    .isInt({ min: 1, max: 5 })
    .withMessage('Timeliness rating must be between 1 and 5'),
  body('aspects.expertise')
    .isInt({ min: 1, max: 5 })
    .withMessage('Expertise rating must be between 1 and 5'),
  handleValidationErrors
];

// Query validation rules
export const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

export const validateExpertQuery = [
  ...validatePagination,
  query('minRating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Minimum rating must be between 0 and 5'),
  query('maxRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum rate must be a positive number'),
  handleValidationErrors
];

// Parameter validation rules
export const validateObjectId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID format'),
  handleValidationErrors
];