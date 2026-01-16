import { Router, Request, Response } from 'express';
import { createOrder } from '../services/orderService';
import { validateCreateOrder, checkValidation } from '../utils/validation';
import { CreateOrderRequest } from '../types';
import { validatePromoCode } from '../services/promoCodeService';

const router = Router();

/**
 * POST /api/orders
 * 
 * Create a new catering order
 */
router.post(
  '/',
  validateCreateOrder,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const orderData: CreateOrderRequest = {
        customer_name: req.body.customer_name,
        customer_email: req.body.customer_email,
        address: req.body.address,
        food_selection: req.body.food_selection,
        date_needed: req.body.date_needed,
        notes: req.body.notes,
        promo_code: req.body.promo_code,
      };

      const order = await createOrder(orderData);

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          status: order.status,
          created_at: order.created_at,
          discount_percent: order.discount_percent,
        },
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Failed to create order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/orders/validate-promo
 * 
 * Validate a promo code (public endpoint for order form)
 */
router.post('/validate-promo', async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ valid: false, error: 'Code is required' });
      return;
    }

    const result = await validatePromoCode(code);
    res.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ 
      valid: false,
      error: 'Failed to validate promo code'
    });
  }
});

export default router;



