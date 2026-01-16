import { Router, Request, Response } from 'express';
import { 
  verifyAdminCredentials, 
  generateAdminToken, 
  requireAdmin 
} from '../middleware/auth';
import { 
  validateAdminLogin, 
  validateApproveOrder,
  validateConfirmTimeAndSendInvoice,
  validateDenyOrder, 
  checkValidation 
} from '../utils/validation';
import { 
  getOrders, 
  getOrderById, 
  approveOrder,
  confirmTimeAndSendInvoice,
  markOrderAsPaid,
  denyOrder 
} from '../services/orderService';
import {
  getAllMenuItemsAdmin,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} from '../services/menuService';
import {
  getAllPromoCodes,
  getPromoCodeById,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  validatePromoCode
} from '../services/promoCodeService';

const router = Router();

/**
 * POST /api/admin/login
 * 
 * Admin login endpoint
 */
router.post(
  '/login',
  validateAdminLogin,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const isValid = await verifyAdminCredentials(email, password);

      if (!isValid) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      const token = generateAdminToken(email);

      res.json({
        message: 'Login successful',
        token,
        email,
      });
    } catch (error) {
      console.error('Error during admin login:', error);
      res.status(500).json({ error: 'Login failed' });
    }
  }
);

/**
 * GET /api/admin/orders
 * 
 * Get all orders, optionally filtered by status
 * Query params: ?status=pending|accepted|denied
 */
router.get('/orders', requireAdmin, async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;

    if (status && !['pending', 'approved_pending_time', 'time_confirmed', 'invoice_sent', 'paid', 'denied'].includes(status)) {
      res.status(400).json({ error: 'Invalid status parameter' });
      return;
    }

    const orders = await getOrders(status);

    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      error: 'Failed to fetch orders',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/orders/:id
 * 
 * Get a single order by ID
 */
router.get('/orders/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await getOrderById(id);

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    res.json({ order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ 
      error: 'Failed to fetch order',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/orders/:id/approve
 * 
 * Approve an order and propose delivery time
 * Status: pending -> approved_pending_time
 */
router.post(
  '/orders/:id/approve',
  requireAdmin,
  validateApproveOrder,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { approval_message } = req.body;

      const order = await approveOrder(id, approval_message);

      res.json({
        message: 'Order approved successfully',
        order,
      });
    } catch (error) {
      console.error('Error approving order:', error);
      res.status(500).json({ 
        error: 'Failed to approve order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/orders/:id/confirm-time-and-send-invoice
 * 
 * Confirm time and send invoice
 * Status: approved_pending_time -> invoice_sent
 */
router.post(
  '/orders/:id/confirm-time-and-send-invoice',
  requireAdmin,
  validateConfirmTimeAndSendInvoice,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { total_price_cents } = req.body;

      const order = await confirmTimeAndSendInvoice(id, total_price_cents);

      res.json({
        message: 'Time confirmed and invoice sent successfully',
        order,
      });
    } catch (error) {
      console.error('Error confirming time and sending invoice:', error);
      res.status(500).json({ 
        error: 'Failed to confirm time and send invoice',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/orders/:id/mark-paid
 * 
 * Mark order as paid (manual override or webhook)
 * Status: invoice_sent -> paid
 */
router.post(
  '/orders/:id/mark-paid',
  requireAdmin,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const order = await markOrderAsPaid(id);

      res.json({
        message: 'Order marked as paid successfully',
        order,
      });
    } catch (error) {
      console.error('Error marking order as paid:', error);
      res.status(500).json({ 
        error: 'Failed to mark order as paid',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * POST /api/admin/orders/:id/deny
 * 
 * Deny an order with a reason
 */
router.post(
  '/orders/:id/deny',
  requireAdmin,
  validateDenyOrder,
  checkValidation,
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { admin_reason } = req.body;

      const order = await denyOrder(id, admin_reason);

      res.json({
        message: 'Order denied successfully',
        order,
      });
    } catch (error) {
      console.error('Error denying order:', error);
      res.status(500).json({ 
        error: 'Failed to deny order',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

/**
 * GET /api/admin/menu
 * 
 * Get all menu items (including unavailable ones)
 */
router.get('/menu', requireAdmin, async (req: Request, res: Response) => {
  try {
    const menuItems = await getAllMenuItemsAdmin();
    res.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu items:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu items',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/menu/:id
 * 
 * Get a single menu item by ID
 */
router.get('/menu/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const menuItem = await getMenuItemById(id);

    if (!menuItem) {
      res.status(404).json({ error: 'Menu item not found' });
      return;
    }

    res.json({ menuItem });
  } catch (error) {
    console.error('Error fetching menu item:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/menu
 * 
 * Create a new menu item
 */
router.post('/menu', requireAdmin, async (req: Request, res: Response) => {
  try {
    const menuItemData = req.body;

    // Basic validation
    if (!menuItemData.id || !menuItemData.name || !menuItemData.description || 
        menuItemData.price_cents === undefined || !menuItemData.category) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['id', 'name', 'description', 'price_cents', 'category']
      });
      return;
    }

    // Validate price
    if (typeof menuItemData.price_cents !== 'number' || menuItemData.price_cents < 0) {
      res.status(400).json({ error: 'price_cents must be a non-negative number' });
      return;
    }

    const menuItem = await createMenuItem(menuItemData);

    res.status(201).json({
      message: 'Menu item created successfully',
      menuItem,
    });
  } catch (error) {
    console.error('Error creating menu item:', error);
    res.status(500).json({ 
      error: 'Failed to create menu item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/menu/:id
 * 
 * Update an existing menu item
 */
router.put('/menu/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate price if provided
    if (updates.price_cents !== undefined) {
      if (typeof updates.price_cents !== 'number' || updates.price_cents < 0) {
        res.status(400).json({ error: 'price_cents must be a non-negative number' });
        return;
      }
    }

    // Don't allow changing the ID
    delete updates.id;

    const menuItem = await updateMenuItem(id, updates);

    res.json({
      message: 'Menu item updated successfully',
      menuItem,
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    res.status(500).json({ 
      error: 'Failed to update menu item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/menu/:id
 * 
 * Delete a menu item
 */
router.delete('/menu/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deleteMenuItem(id);

    res.json({
      message: 'Menu item deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting menu item:', error);
    res.status(500).json({ 
      error: 'Failed to delete menu item',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/promo-codes
 * 
 * Get all promo codes
 */
router.get('/promo-codes', requireAdmin, async (req: Request, res: Response) => {
  try {
    const promoCodes = await getAllPromoCodes();
    res.json({ promoCodes });
  } catch (error) {
    console.error('Error fetching promo codes:', error);
    res.status(500).json({ 
      error: 'Failed to fetch promo codes',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * GET /api/admin/promo-codes/:id
 * 
 * Get a single promo code by ID
 */
router.get('/promo-codes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const promoCode = await getPromoCodeById(id);

    if (!promoCode) {
      res.status(404).json({ error: 'Promo code not found' });
      return;
    }

    res.json({ promoCode });
  } catch (error) {
    console.error('Error fetching promo code:', error);
    res.status(500).json({ 
      error: 'Failed to fetch promo code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/promo-codes
 * 
 * Create a new promo code
 */
router.post('/promo-codes', requireAdmin, async (req: Request, res: Response) => {
  try {
    const promoCodeData = req.body;

    // Basic validation
    if (!promoCodeData.code || promoCodeData.discount_percent === undefined) {
      res.status(400).json({ 
        error: 'Missing required fields',
        required: ['code', 'discount_percent']
      });
      return;
    }

    // Validate discount_percent
    if (typeof promoCodeData.discount_percent !== 'number' || 
        promoCodeData.discount_percent <= 0 || 
        promoCodeData.discount_percent > 100) {
      res.status(400).json({ error: 'discount_percent must be a number between 1 and 100' });
      return;
    }

    const promoCode = await createPromoCode(promoCodeData);

    res.status(201).json({
      message: 'Promo code created successfully',
      promoCode,
    });
  } catch (error) {
    console.error('Error creating promo code:', error);
    res.status(500).json({ 
      error: 'Failed to create promo code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * PUT /api/admin/promo-codes/:id
 * 
 * Update an existing promo code
 */
router.put('/promo-codes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Validate discount_percent if provided
    if (updates.discount_percent !== undefined) {
      if (typeof updates.discount_percent !== 'number' || 
          updates.discount_percent <= 0 || 
          updates.discount_percent > 100) {
        res.status(400).json({ error: 'discount_percent must be a number between 1 and 100' });
        return;
      }
    }

    // Don't allow changing the ID
    delete updates.id;

    const promoCode = await updatePromoCode(id, updates);

    res.json({
      message: 'Promo code updated successfully',
      promoCode,
    });
  } catch (error) {
    console.error('Error updating promo code:', error);
    res.status(500).json({ 
      error: 'Failed to update promo code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * DELETE /api/admin/promo-codes/:id
 * 
 * Delete a promo code
 */
router.delete('/promo-codes/:id', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await deletePromoCode(id);

    res.json({
      message: 'Promo code deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting promo code:', error);
    res.status(500).json({ 
      error: 'Failed to delete promo code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/admin/promo-codes/validate
 * 
 * Validate a promo code (admin endpoint)
 */
router.post('/promo-codes/validate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ error: 'Code is required' });
      return;
    }

    const result = await validatePromoCode(code);
    res.json(result);
  } catch (error) {
    console.error('Error validating promo code:', error);
    res.status(500).json({ 
      error: 'Failed to validate promo code',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


