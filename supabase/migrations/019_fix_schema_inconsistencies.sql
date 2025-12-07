-- =====================================================
-- FIX SCHEMA INCONSISTENCIES
-- Standardize column names and fix conflicts
-- =====================================================

-- =====================================================
-- 1. FIX SITE_SETTINGS TABLE
-- Standardize on 'key' and 'value' (not setting_key/setting_value)
-- =====================================================

-- Drop the constraint on setting_key if it exists
ALTER TABLE site_settings DROP CONSTRAINT IF EXISTS site_settings_setting_key_key;

-- Rename setting_key to key if setting_key exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='site_settings' AND column_name='setting_key'
    ) THEN
        ALTER TABLE site_settings RENAME COLUMN setting_key TO key;
    END IF;
END$$;

-- Rename setting_value to value if setting_value exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='site_settings' AND column_name='setting_value'
    ) THEN
        ALTER TABLE site_settings RENAME COLUMN setting_value TO value;
    END IF;
END$$;

-- Rename setting_type to data_type if setting_type exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='site_settings' AND column_name='setting_type'
    ) THEN
        ALTER TABLE site_settings RENAME COLUMN setting_type TO data_type;
    END IF;
END$$;

-- Ensure key column is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_site_settings_key_unique ON site_settings(key);

-- Ensure value column exists and is JSONB
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name='site_settings' AND column_name='value'
    ) THEN
        ALTER TABLE site_settings ADD COLUMN value JSONB DEFAULT '{}'::jsonb;
    END IF;
END$$;

-- =====================================================
-- 2. FIX EMAIL_TEMPLATES TABLE
-- Standardize on 'slug' (remove template_key)
-- =====================================================

-- Drop template_key column if it exists (we'll use slug)
ALTER TABLE email_templates DROP COLUMN IF EXISTS template_key;

-- Ensure slug is unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_templates_slug_unique ON email_templates(slug);

-- =====================================================
-- 3. FIX MEDIA_LIBRARY_FOLDERS TABLE
-- Ensure all columns exist
-- =====================================================

-- Add missing columns if they don't exist
ALTER TABLE media_library_folders
  ADD COLUMN IF NOT EXISTS created_by TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT;

-- =====================================================
-- 4. STANDARDIZE ALL TIMESTAMPS
-- Ensure consistent timestamp columns across tables
-- =====================================================

-- Function to add standard timestamp columns to a table
CREATE OR REPLACE FUNCTION add_standard_timestamps(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE format('
        ALTER TABLE %I
          ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
          ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()
    ', table_name);
END;
$$ LANGUAGE plpgsql;

-- Add timestamps to tables that might be missing them
SELECT add_standard_timestamps('site_settings');
SELECT add_standard_timestamps('theme_settings');
SELECT add_standard_timestamps('menu_items');
SELECT add_standard_timestamps('content_blocks');
SELECT add_standard_timestamps('feature_flags');

-- Drop the temporary function
DROP FUNCTION add_standard_timestamps(TEXT);

-- =====================================================
-- 5. FIX CONTENT_BLOCKS TABLE
-- Add missing updated_by column
-- =====================================================

ALTER TABLE content_blocks
  ADD COLUMN IF NOT EXISTS updated_by TEXT,
  ADD COLUMN IF NOT EXISTS created_by TEXT;

-- =====================================================
-- 6. UPDATE INDEXES
-- Ensure proper indexes exist for performance
-- =====================================================

-- Site settings
CREATE INDEX IF NOT EXISTS idx_site_settings_category ON site_settings(category);
CREATE INDEX IF NOT EXISTS idx_site_settings_public ON site_settings(is_public);

-- Menu items
CREATE INDEX IF NOT EXISTS idx_menu_items_location ON menu_items(menu_location);
CREATE INDEX IF NOT EXISTS idx_menu_items_visible ON menu_items(is_visible);

-- Content blocks
CREATE INDEX IF NOT EXISTS idx_content_blocks_page ON content_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_published ON content_blocks(is_published);

-- Feature flags
CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags(feature_key);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled ON feature_flags(is_enabled);

COMMENT ON MIGRATION IS 'Fix schema inconsistencies and standardize column names';
