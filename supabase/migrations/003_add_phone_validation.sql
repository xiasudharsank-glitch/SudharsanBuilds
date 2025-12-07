-- Step 1: Make phone optional (allow NULL)
ALTER TABLE inquiries 
ALTER COLUMN phone DROP NOT NULL;

-- Step 2: Clean up any existing invalid phone numbers
UPDATE inquiries 
SET phone = NULL 
WHERE phone IS NOT NULL 
AND phone != ''
AND phone !~* '^\+?[1-9]\d{7,14}$';

-- Step 3: Drop existing constraint if any
ALTER TABLE inquiries
DROP CONSTRAINT IF EXISTS valid_phone_format;

-- Step 4: Add new validation constraint (allows NULL)
ALTER TABLE inquiries
ADD CONSTRAINT valid_phone_format
CHECK (
  phone IS NULL 
  OR phone = '' 
  OR phone ~* '^\+?[1-9]\d{7,14}$'
);

-- Step 5: Same for invoices table (if exists)
ALTER TABLE invoices 
ALTER COLUMN customer_phone DROP NOT NULL;

UPDATE invoices 
SET customer_phone = NULL 
WHERE customer_phone IS NOT NULL 
AND customer_phone != ''
AND customer_phone !~* '^\+?[1-9]\d{7,14}$';

ALTER TABLE invoices
DROP CONSTRAINT IF EXISTS valid_phone_format;

ALTER TABLE invoices
ADD CONSTRAINT valid_phone_format
CHECK (
  customer_phone IS NULL 
  OR customer_phone = '' 
  OR customer_phone ~* '^\+?[1-9]\d{7,14}$'
);