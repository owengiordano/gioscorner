import { Router } from 'express';
import { createOrder } from '../services/orderService';
import { validateCreateOrder, checkValidation } from '../utils/validation';
import { CreateOrderRequest } from '../types';

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
  async (req, res) => {
    try {
      const orderData: CreateOrderRequest = {
        customer_name: req.body.customer_name,
        customer_email: req.body.customer_email,
        address: req.body.address,
        food_selection: req.body.food_selection,
        date_needed: req.body.date_needed,
        notes: req.body.notes,
      };

      const order = await createOrder(orderData);

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order.id,
          status: order.status,
          created_at: order.created_at,
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

export default router;



