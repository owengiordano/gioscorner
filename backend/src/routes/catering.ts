import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { sendCateringInterestNotification } from '../services/emailService';

const router = Router();

/**
 * POST /api/catering-interest
 * 
 * Submit email for catering menu launch updates
 */
router.post(
  '/',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
  ],
  async (req: Request, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed',
        details: errors.array() 
      });
    }

    try {
      const { email } = req.body;
      
      await sendCateringInterestNotification(email);

      res.status(200).json({
        message: 'Thank you for your interest! We\'ll notify you when our catering menu launches.',
      });
    } catch (error) {
      console.error('Error submitting catering interest:', error);
      res.status(500).json({ 
        error: 'Failed to submit your request. Please try again.',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
