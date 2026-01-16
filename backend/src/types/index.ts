// Type definitions for Gio's Corner backend

export interface MenuItem {
  id: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  description: string;
  bio?: string; // Detailed description
  detailed_info?: string; // Even more detailed information for modal
  price_cents: number;
  category: string;
  serves?: number;
  image_colors?: string[]; // Array of color codes for placeholder images
  display_order?: number;
  is_available?: boolean;
  is_active?: boolean; // Whether item is currently active (true) or coming soon (false)
  available_days?: number[]; // Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
}

export interface FoodSelectionItem {
  menu_item_id: string;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_email: string;
  address: string;
  food_selection: FoodSelectionItem[];
  date_needed: string;
  notes?: string;
  status: 'pending' | 'approved_pending_time' | 'time_confirmed' | 'invoice_sent' | 'paid' | 'denied';
  admin_reason?: string;
  approval_message?: string;
  time_confirmed_at?: string;
  invoice_sent_at?: string;
  paid_at?: string;
  stripe_invoice_id?: string;
  stripe_invoice_url?: string;
  total_price_cents?: number;
  promo_code_id?: string;
  discount_percent?: number;
  original_price_cents?: number;
}

export interface CreateOrderRequest {
  customer_name: string;
  customer_email: string;
  address: string;
  food_selection: FoodSelectionItem[];
  date_needed: string;
  notes?: string;
  promo_code?: string;
}

export interface ApproveOrderRequest {
  approval_message: string;
}

export interface ConfirmTimeAndSendInvoiceRequest {
  total_price_cents: number;
}

export interface DenyOrderRequest {
  admin_reason: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  email: string;
}

export interface JWTPayload {
  email: string;
  iat: number;
  exp: number;
}

export interface PromoCode {
  id: string;
  created_at: string;
  updated_at: string;
  code: string;
  description?: string;
  discount_percent: number;
  max_uses?: number;
  current_uses: number;
  valid_from: string;
  valid_until?: string;
  is_active: boolean;
}

export interface CreatePromoCodeRequest {
  code: string;
  description?: string;
  discount_percent: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface UpdatePromoCodeRequest {
  code?: string;
  description?: string;
  discount_percent?: number;
  max_uses?: number;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
}

export interface ValidatePromoCodeResponse {
  valid: boolean;
  promo_code?: PromoCode;
  error?: string;
}

