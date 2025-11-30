import { MenuItem } from '../types';

/**
 * Menu Configuration
 * 
 * Edit this file to update menu items, prices, and descriptions.
 * Prices are stored in cents (e.g., 5000 = $50.00)
 */

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'family-dinner-meal',
    name: 'Family Dinner Meal',
    description: 'Complete family-style dinner with your choice of entree, two sides, and dessert. Perfect for gatherings!',
    price_cents: 5000, // $50.00
    category: 'meals',
    serves: 4
  },
  {
    id: 'party-platter',
    name: 'Party Platter',
    description: 'Generous platter with assorted appetizers and finger foods. Great for parties and events.',
    price_cents: 7500, // $75.00
    category: 'platters',
    serves: 8
  },
  {
    id: 'sandwich-box',
    name: 'Sandwich Box',
    description: 'Assorted gourmet sandwiches with chips and cookies. Perfect for meetings and lunches.',
    price_cents: 12000, // $120.00
    category: 'boxes',
    serves: 10
  },
  {
    id: 'pasta-bar',
    name: 'Pasta Bar',
    description: 'Build-your-own pasta bar with multiple pasta types, sauces, and toppings. Includes garlic bread.',
    price_cents: 15000, // $150.00
    category: 'meals',
    serves: 15
  },
  {
    id: 'taco-bar',
    name: 'Taco Bar',
    description: 'Complete taco bar with seasoned meats, tortillas, and all the fixings. Includes chips and salsa.',
    price_cents: 13500, // $135.00
    category: 'meals',
    serves: 12
  },
  {
    id: 'dessert-platter',
    name: 'Dessert Platter',
    description: 'Assorted homemade desserts including cookies, brownies, and seasonal treats.',
    price_cents: 4000, // $40.00
    category: 'desserts',
    serves: 8
  }
];

/**
 * Get menu item by ID
 */
export function getMenuItemById(id: string): MenuItem | undefined {
  return MENU_ITEMS.find(item => item.id === id);
}

/**
 * Get all menu items
 */
export function getAllMenuItems(): MenuItem[] {
  return MENU_ITEMS;
}

/**
 * Calculate total price for a food selection
 */
export function calculateTotalPrice(foodSelection: Array<{ menu_item_id: string; quantity: number }>): number {
  let total = 0;
  
  for (const item of foodSelection) {
    const menuItem = getMenuItemById(item.menu_item_id);
    if (menuItem) {
      total += menuItem.price_cents * item.quantity;
    }
  }
  
  return total;
}



