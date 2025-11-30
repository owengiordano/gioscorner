import { supabase } from '../config/database';
import { MenuItem } from '../types';

/**
 * Menu Service
 * 
 * Handles all database operations for menu items
 */

/**
 * Get all menu items
 */
export async function getAllMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error);
    throw new Error(`Failed to fetch menu items: ${error.message}`);
  }

  return data || [];
}

/**
 * Get all menu items (including unavailable ones) - for admin
 */
export async function getAllMenuItemsAdmin(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching menu items:', error);
    throw new Error(`Failed to fetch menu items: ${error.message}`);
  }

  return data || [];
}

/**
 * Get a single menu item by ID
 */
export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching menu item:', error);
    throw new Error(`Failed to fetch menu item: ${error.message}`);
  }

  return data;
}

/**
 * Create a new menu item
 */
export async function createMenuItem(menuItem: Omit<MenuItem, 'created_at' | 'updated_at'>): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .insert([menuItem])
    .select()
    .single();

  if (error) {
    console.error('Error creating menu item:', error);
    throw new Error(`Failed to create menu item: ${error.message}`);
  }

  return data;
}

/**
 * Update an existing menu item
 */
export async function updateMenuItem(id: string, updates: Partial<Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>>): Promise<MenuItem> {
  const { data, error } = await supabase
    .from('menu_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating menu item:', error);
    throw new Error(`Failed to update menu item: ${error.message}`);
  }

  return data;
}

/**
 * Delete a menu item
 */
export async function deleteMenuItem(id: string): Promise<void> {
  const { error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting menu item:', error);
    throw new Error(`Failed to delete menu item: ${error.message}`);
  }
}

/**
 * Calculate total price for a food selection
 */
export async function calculateTotalPrice(foodSelection: Array<{ menu_item_id: string; quantity: number }>): Promise<number> {
  let total = 0;
  
  for (const item of foodSelection) {
    const menuItem = await getMenuItemById(item.menu_item_id);
    if (menuItem) {
      total += menuItem.price_cents * item.quantity;
    }
  }
  
  return total;
}


