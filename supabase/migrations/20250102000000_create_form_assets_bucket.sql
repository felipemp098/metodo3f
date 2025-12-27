-- Create storage bucket for form assets (logos and backgrounds)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'form-assets',
  'form-assets',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for form-assets bucket
-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload form assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = 'forms'
);

-- Allow authenticated users to update their own files
CREATE POLICY "Authenticated users can update form assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = 'forms'
);

-- Allow authenticated users to delete their own files
CREATE POLICY "Authenticated users can delete form assets"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'form-assets' AND
  (storage.foldername(name))[1] = 'forms'
);

-- Allow public read access to form assets
CREATE POLICY "Public can view form assets"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'form-assets');

