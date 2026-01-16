import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * Validation utilities using express-validator
 */

/**
 * Middleware to check validation results
 */
export function checkValidation(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ 
      error: 'Validation failed', 
      details: errors.array() 
    });
    return;
  }
  next();
}

/**
 * Validation rules for creating an order
 */
export const validateCreateOrder = [
  body('customer_name')
    .trim()
    .notEmpty()
    .withMessage('Customer name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('customer_email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address')
    .normalizeEmail(),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Delivery address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('food_selection')
    .isArray({ min: 1 })
    .withMessage('Food selection must be a non-empty array'),
  
  body('food_selection.*.menu_item_id')
    .trim()
    .notEmpty()
    .withMessage('Menu item ID is required'),
  
  body('food_selection.*.quantity')
    .isInt({ min: 1, max: 100 })
    .withMessage('Quantity must be between 1 and 100'),
  
  body('date_needed')
    .notEmpty()
    .withMessage('Date needed is required')
    .isISO8601()
    .withMessage('Date must be in valid format (YYYY-MM-DD)')
    .custom((value) => {
      // Parse the date string as a local date (not UTC)
      const [year, month, day] = value.split('-').map(Number);
      const requestedDate = new Date(year, month - 1, day); // month is 0-indexed
      requestedDate.setHours(0, 0, 0, 0); // Start of requested day
      
      const now = new Date();
      const cutoffHour = 15; // 3pm cutoff
      
      // Calculate minimum allowed date based on 3pm cutoff
      // If before 3pm, minimum is tomorrow
      // If 3pm or later, minimum is day after tomorrow
      const minDate = new Date(now);
      minDate.setHours(0, 0, 0, 0); // Start of today
      
      if (now.getHours() < cutoffHour) {
        // Before 3pm - minimum is tomorrow
        minDate.setDate(minDate.getDate() + 1);
      } else {
        // 3pm or later - minimum is day after tomorrow
        minDate.setDate(minDate.getDate() + 2);
      }
      
      if (requestedDate < minDate) {
        const minDateFormatted = minDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
        throw new Error(`Orders must be placed by 3:00 PM the day before delivery. The earliest available date is ${minDateFormatted}.`);
      }
      
      return true;
    }),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must be less than 1000 characters'),
];

/**
 * Validation rules for approving an order
 */
export const validateApproveOrder = [
  body('approval_message')
    .trim()
    .notEmpty()
    .withMessage('Approval message is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Approval message must be between 10 and 1000 characters'),
];

/**
 * Validation rules for confirming time and sending invoice
 */
export const validateConfirmTimeAndSendInvoice = [
  body('total_price_cents')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Total price must be a positive integer (in cents)'),
];

/**
 * Validation rules for denying an order
 */
export const validateDenyOrder = [
  body('admin_reason')
    .trim()
    .notEmpty()
    .withMessage('Admin reason is required')
    .isLength({ min: 10, max: 1000 })
    .withMessage('Reason must be between 10 and 1000 characters'),
];

/**
 * Validation rules for admin login
 */
export const validateAdminLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Must be a valid email address'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];



