-- Create artist_images table for storing portfolio gallery images
CREATE TABLE IF NOT EXISTS artist_images (
  image_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id TEXT NOT NULL REFERENCES artist_portfolio(artist_id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups by artist_id
CREATE INDEX IF NOT EXISTS idx_artist_images_artist_id ON artist_images(artist_id);

-- Create index for ordering
CREATE INDEX IF NOT EXISTS idx_artist_images_display_order ON artist_images(artist_id, display_order);

-- Enable Row Level Security
ALTER TABLE artist_images ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view images
CREATE POLICY "Anyone can view artist images"
  ON artist_images
  FOR SELECT
  USING (true);

-- Policy: Only the artist owner can insert their own images
CREATE POLICY "Artists can insert their own images"
  ON artist_images
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM artist_user
      WHERE artist_user.artist_id = artist_images.artist_id
      AND artist_user.auth_id = auth.uid()
    )
  );

-- Policy: Only the artist owner can update their own images
CREATE POLICY "Artists can update their own images"
  ON artist_images
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM artist_user
      WHERE artist_user.artist_id = artist_images.artist_id
      AND artist_user.auth_id = auth.uid()
    )
  );

-- Policy: Only the artist owner can delete their own images
CREATE POLICY "Artists can delete their own images"
  ON artist_images
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM artist_user
      WHERE artist_user.artist_id = artist_images.artist_id
      AND artist_user.auth_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_artist_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_artist_images_updated_at
  BEFORE UPDATE ON artist_images
  FOR EACH ROW
  EXECUTE FUNCTION update_artist_images_updated_at();
