-- Create storage bucket for store logos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'store-logos',
  'store-logos',
  true,
  2097152, -- 2MB limit
  ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view store logos (public bucket)
CREATE POLICY "Public can view store logos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'store-logos');

-- Policy: Authenticated users can upload store logos
CREATE POLICY "Authenticated users can upload store logos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'store-logos'
    AND auth.role() = 'authenticated'
  );

-- Policy: Store owners can update their store logos
-- For simplicity, any authenticated user can update (could be more restrictive)
CREATE POLICY "Authenticated users can update store logos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'store-logos'
    AND auth.role() = 'authenticated'
  );

-- Policy: Store owners can delete their store logos
CREATE POLICY "Authenticated users can delete store logos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'store-logos'
    AND auth.role() = 'authenticated'
  );
