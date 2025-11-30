import { Router, Request, Response } from 'express';
import { getAllMenuItems } from '../services/menuService';

const router = Router();

/**
 * GET /api/menu
 * 
 * Get all available menu items
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const menuItems = await getAllMenuItems();
    res.json({ menuItems });
  } catch (error) {
    console.error('Error fetching menu:', error);
    res.status(500).json({ 
      error: 'Failed to fetch menu',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;


