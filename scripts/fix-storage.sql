-- RUN THIS IN SUPABASE DASHBOARD -> SQL EDITOR

-- 1. Create the 'products' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('products', 'products', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. Ensure RLS is enabled on objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Drop old policies to avoid conflicts
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own images" ON storage.objects;

-- 4. Create Policies

-- Allow public read access to all files in 'products' bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT 
USING (bucket_id = 'products');

-- Allow any authenticated user to upload files to 'products' bucket
CREATE POLICY "Authenticated Upload" ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'products' AND auth.role() = 'authenticated');

-- Allow users to update their own files (if they are the owner)
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE
USING (bucket_id = 'products' AND auth.uid() = owner);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND auth.uid() = owner);
