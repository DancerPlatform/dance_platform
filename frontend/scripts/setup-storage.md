# Supabase Storage Setup

To enable image uploads for artist profile pictures, you need to create a storage bucket in Supabase.

## Steps:

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Navigate to "Storage" in the left sidebar
4. Click "Create a new bucket"
5. Set the following:
   - **Name**: `artist-images`
   - **Public**: ✅ Check this (to allow public access to images)
   - **File size limit**: 5 MB (or as needed)
   - **Allowed MIME types**: `image/*`

## Alternatively, you can create it programmatically:

Run this in your Supabase SQL Editor:

```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-images', 'artist-images', true);

-- Set up storage policy to allow authenticated users to upload
CREATE POLICY "Allow authenticated users to upload artist images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artist-images');

-- Allow public read access
CREATE POLICY "Allow public read access to artist images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artist-images');

-- Allow authenticated users to update their own images
CREATE POLICY "Allow authenticated users to update artist images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artist-images');

-- Allow authenticated users to delete artist images
CREATE POLICY "Allow authenticated users to delete artist images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'artist-images');
```

After setting this up, artists will be able to upload profile pictures in the edit portfolio page.
