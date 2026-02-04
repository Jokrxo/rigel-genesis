-- Add type column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS type text DEFAULT 'inventory' CHECK (type IN ('inventory', 'service'));

-- Update existing products to have type 'inventory' if null (handled by default but good to be explicit)
UPDATE products SET type = 'inventory' WHERE type IS NULL;
