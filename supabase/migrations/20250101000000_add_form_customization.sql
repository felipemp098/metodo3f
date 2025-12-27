-- Add customization_settings column to forms table
ALTER TABLE forms 
ADD COLUMN IF NOT EXISTS customization_settings JSONB DEFAULT '{}'::jsonb;

-- Add comment to the column
COMMENT ON COLUMN forms.customization_settings IS 'JSON object containing form customization settings (background_image_url, primary_color, secondary_color, text_color, logo_url, etc.)';

