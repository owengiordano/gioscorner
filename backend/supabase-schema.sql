-- Gio's Corner Database Schema
-- Run this in your Supabase SQL Editor

-- Create updated_at trigger function (used by both tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create menu_items table
CREATE TABLE IF NOT EXISTS menu_items (
  id TEXT PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Menu item details
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  bio TEXT,
  detailed_info TEXT,
  price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
  category TEXT NOT NULL,
  serves INTEGER,
  image_colors TEXT[], -- Array of color codes for placeholder images
  
  -- Display order and availability
  display_order INTEGER DEFAULT 0,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true, -- Whether item is currently active (true) or coming soon (false)
  available_days INTEGER[] DEFAULT ARRAY[0,1,2,3,4,5,6], -- Days of week: 0=Sunday, 1=Monday, ..., 6=Saturday
  
  CONSTRAINT valid_days CHECK (
    available_days IS NULL OR 
    (array_length(available_days, 1) > 0 AND 
     available_days <@ ARRAY[0,1,2,3,4,5,6])
  )
);

-- Create index on category for filtering
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);

-- Create index on display_order for sorting
CREATE INDEX IF NOT EXISTS idx_menu_items_display_order ON menu_items(display_order);

-- Create updated_at trigger for menu_items
CREATE TRIGGER update_menu_items_updated_at 
  BEFORE UPDATE ON menu_items 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for menu_items
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to read menu items (both active and coming soon)
CREATE POLICY "Anyone can read menu items" ON menu_items
  FOR SELECT
  USING (is_available = true);

-- Create policy to allow service role to do everything
CREATE POLICY "Service role can manage menu items" ON menu_items
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE menu_items IS 'Menu items available for catering orders';
COMMENT ON COLUMN menu_items.price_cents IS 'Price in cents';
COMMENT ON COLUMN menu_items.image_colors IS 'Array of color codes for placeholder gradient';
COMMENT ON COLUMN menu_items.available_days IS 'Days of week when item can be ordered: 0=Sunday, 1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday, 6=Saturday';

-- Insert default menu items
INSERT INTO menu_items (id, name, description, price_cents, category, serves) VALUES
  ('family-dinner-meal', 'Family Dinner Meal', 'Complete family-style dinner with your choice of entree, two sides, and dessert. Perfect for gatherings!', 5000, 'meals', 4),
  ('party-platter', 'Party Platter', 'Generous platter with assorted appetizers and finger foods. Great for parties and events.', 7500, 'platters', 8),
  ('sandwich-box', 'Sandwich Box', 'Assorted gourmet sandwiches with chips and cookies. Perfect for meetings and lunches.', 12000, 'boxes', 10),
  ('pasta-bar', 'Pasta Bar', 'Build-your-own pasta bar with multiple pasta types, sauces, and toppings. Includes garlic bread.', 15000, 'meals', 15),
  ('taco-bar', 'Taco Bar', 'Complete taco bar with seasoned meats, tortillas, and all the fixings. Includes chips and salsa.', 13500, 'meals', 12),
  ('dessert-platter', 'Dessert Platter', 'Assorted homemade desserts including cookies, brownies, and seasonal treats.', 4000, 'desserts', 8)
ON CONFLICT (id) DO NOTHING;

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Customer information
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  address TEXT NOT NULL,
  
  -- Order details
  food_selection JSONB NOT NULL,
  date_needed DATE NOT NULL,
  notes TEXT,
  
  -- Status and admin fields
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'denied')),
  admin_reason TEXT,
  
  -- Stripe fields
  stripe_invoice_id TEXT,
  stripe_invoice_url TEXT,
  total_price_cents INTEGER,
  
  -- Indexes for common queries
  CONSTRAINT valid_email CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Create updated_at trigger for orders
CREATE TRIGGER update_orders_updated_at 
  BEFORE UPDATE ON orders 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policy to allow service role to do everything
-- (Your backend will use the service role key)
CREATE POLICY "Service role can do everything" ON orders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Optional: Create policy for authenticated users to read their own orders
-- (if you want to add customer login in the future)
CREATE POLICY "Users can read their own orders" ON orders
  FOR SELECT
  TO authenticated
  USING (customer_email = auth.jwt() ->> 'email');

COMMENT ON TABLE orders IS 'Catering orders for Gio''s Corner';
COMMENT ON COLUMN orders.food_selection IS 'JSON array of menu items with quantities';
COMMENT ON COLUMN orders.total_price_cents IS 'Total price in cents for Stripe';


