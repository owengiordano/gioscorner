import { supabase } from '../config/database';
import { PromoCode, CreatePromoCodeRequest, UpdatePromoCodeRequest, ValidatePromoCodeResponse } from '../types';

/**
 * Promo Code Service
 * 
 * Handles all business logic for promo code management.
 */

/**
 * Get all promo codes
 */
export async function getAllPromoCodes(): Promise<PromoCode[]> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Database error fetching promo codes:', error);
    throw new Error(`Failed to fetch promo codes: ${error.message}`);
  }

  return data as PromoCode[];
}

/**
 * Get a single promo code by ID
 */
export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Database error fetching promo code:', error);
    throw new Error(`Failed to fetch promo code: ${error.message}`);
  }

  return data as PromoCode;
}

/**
 * Get a promo code by its code string
 */
export async function getPromoCodeByCode(code: string): Promise<PromoCode | null> {
  const { data, error } = await supabase
    .from('promo_codes')
    .select('*')
    .eq('code', code.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Database error fetching promo code:', error);
    throw new Error(`Failed to fetch promo code: ${error.message}`);
  }

  return data as PromoCode;
}

/**
 * Validate a promo code for use
 */
export async function validatePromoCode(code: string): Promise<ValidatePromoCodeResponse> {
  const promoCode = await getPromoCodeByCode(code);

  if (!promoCode) {
    return { valid: false, error: 'Promo code not found' };
  }

  if (!promoCode.is_active) {
    return { valid: false, error: 'This promo code is no longer active' };
  }

  const now = new Date();
  const validFrom = new Date(promoCode.valid_from);
  
  if (now < validFrom) {
    return { valid: false, error: 'This promo code is not yet valid' };
  }

  if (promoCode.valid_until) {
    const validUntil = new Date(promoCode.valid_until);
    if (now > validUntil) {
      return { valid: false, error: 'This promo code has expired' };
    }
  }

  if (promoCode.max_uses !== null && promoCode.current_uses >= promoCode.max_uses) {
    return { valid: false, error: 'This promo code has reached its usage limit' };
  }

  return { valid: true, promo_code: promoCode };
}

/**
 * Create a new promo code
 */
export async function createPromoCode(promoCodeData: CreatePromoCodeRequest): Promise<PromoCode> {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert({
      code: promoCodeData.code.toUpperCase(),
      description: promoCodeData.description,
      discount_percent: promoCodeData.discount_percent,
      max_uses: promoCodeData.max_uses,
      valid_from: promoCodeData.valid_from || new Date().toISOString(),
      valid_until: promoCodeData.valid_until,
      is_active: promoCodeData.is_active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error('Database error creating promo code:', error);
    if (error.code === '23505') {
      throw new Error('A promo code with this code already exists');
    }
    throw new Error(`Failed to create promo code: ${error.message}`);
  }

  return data as PromoCode;
}

/**
 * Update an existing promo code
 */
export async function updatePromoCode(id: string, updates: UpdatePromoCodeRequest): Promise<PromoCode> {
  // If code is being updated, convert to uppercase
  if (updates.code) {
    updates.code = updates.code.toUpperCase();
  }

  const { data, error } = await supabase
    .from('promo_codes')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Database error updating promo code:', error);
    if (error.code === '23505') {
      throw new Error('A promo code with this code already exists');
    }
    throw new Error(`Failed to update promo code: ${error.message}`);
  }

  return data as PromoCode;
}

/**
 * Delete a promo code
 */
export async function deletePromoCode(id: string): Promise<void> {
  const { error } = await supabase
    .from('promo_codes')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Database error deleting promo code:', error);
    throw new Error(`Failed to delete promo code: ${error.message}`);
  }
}

/**
 * Increment the usage count for a promo code
 */
export async function incrementPromoCodeUsage(id: string): Promise<void> {
  const { error } = await supabase
    .rpc('increment_promo_code_usage', { promo_code_id: id });

  // If the RPC doesn't exist, fall back to manual increment
  if (error) {
    const promoCode = await getPromoCodeById(id);
    if (promoCode) {
      await supabase
        .from('promo_codes')
        .update({ current_uses: promoCode.current_uses + 1 })
        .eq('id', id);
    }
  }
}
