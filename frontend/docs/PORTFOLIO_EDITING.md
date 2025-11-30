# Portfolio Editing Feature

## Overview

Artists can now edit their portfolios directly through the web interface. All changes are managed locally and only saved when the artist clicks the "저장하기" (Save) button.

## Files Created/Modified

### New Files:
1. **[app/main/profile/edit-portfolio/page.tsx](../app/main/profile/edit-portfolio/page.tsx)** - Edit portfolio page route
2. **[components/EditPortfolioClient.tsx](../components/EditPortfolioClient.tsx)** - Main edit portfolio component
3. **[app/api/artists/[artist_id]/portfolio/route.ts](../app/api/artists/[artist_id]/portfolio/route.ts)** - API endpoint for saving changes
4. **[scripts/setup-storage.md](../scripts/setup-storage.md)** - Supabase storage setup instructions

### Modified Files:
1. **[app/main/profile/page.tsx](../app/main/profile/page.tsx)** - Added link to edit portfolio
2. **[components/ArtistPortfolioClient.tsx](../components/ArtistPortfolioClient.tsx)** - Added media_id and song_id to interfaces

## Setup Requirements

### 1. Install Dependencies

The following packages were installed:
```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

### 2. Set Up Supabase Storage

You MUST create a storage bucket for profile images. Follow the instructions in [scripts/setup-storage.md](../scripts/setup-storage.md).

**Quick Setup via SQL:**
```sql
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-images', 'artist-images', true);

-- Set up storage policies
CREATE POLICY "Allow authenticated users to upload artist images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'artist-images');

CREATE POLICY "Allow public read access to artist images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'artist-images');

CREATE POLICY "Allow authenticated users to update artist images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'artist-images');

CREATE POLICY "Allow authenticated users to delete artist images"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'artist-images');
```

## Features

### 1. Profile Image Upload
- Click on profile image to upload new image
- Images are uploaded to Supabase Storage bucket `artist-images`
- Automatic URL replacement in portfolio

### 2. Editable Basic Information
- Artist name (Korean)
- Artist name (English)
- Introduction/bio
- Social media links (Instagram, Twitter, YouTube)

### 3. Drag & Drop Reordering
- Choreography items can be reordered
- Media items can be reordered in grid
- Display order automatically updated on drag

### 4. Highlight Management
- Star icon to toggle highlights on/off
- Works for both choreography and media items
- Visual feedback with filled/unfilled stars

### 5. Remove Items
- Trash icon to remove choreography items
- Trash icon to remove media items
- Items are deleted from database on save

### 6. Local State Management
- All changes stored in React state
- No automatic saves or realtime updates
- Changes only applied when "저장하기" is clicked

## How to Use

### For Artists:

1. **Navigate to Edit Page**
   - Log in as an artist
   - Go to `/main/profile`
   - Click "포트폴리오 수정" button

2. **Edit Profile Image**
   - Hover over profile picture
   - Click to open file picker
   - Select an image file
   - Image uploads automatically to Supabase Storage

3. **Edit Basic Info**
   - Click on name fields to edit
   - Edit introduction in text area
   - Update social media URLs

4. **Reorder Portfolio Items**
   - Drag the grip icon (⋮⋮) to reorder
   - Drop in desired position
   - Order updates automatically in the UI

5. **Toggle Highlights**
   - Click star icon on items
   - Yellow filled star = highlighted
   - Gray empty star = not highlighted

6. **Remove Items**
   - Click trash icon to remove
   - Item disappears immediately
   - Actual deletion happens on save

7. **Save Changes**
   - Click "저장하기" button in top-right
   - Wait for "저장 중..." indicator
   - Success message appears
   - Redirected back to profile page

8. **Cancel Changes**
   - Click back arrow in top-left
   - All changes are discarded
   - Returns to profile page

## Database Structure

### Tables Updated:

1. **artist_portfolio**
   - artist_name, artist_name_eng, introduction
   - photo, instagram, twitter, youtube

2. **dancer_choreo**
   - Composite PK: (song_id, artist_id)
   - Updated: role, is_highlight, display_order
   - Note: Songs are NOT deleted, only the relationship

3. **dancer_media**
   - PK: media_id (UUID)
   - Updated: youtube_link, role, is_highlight, display_order, title, video_date
   - Deleted: Items removed by user

### Authentication

- Uses Supabase Auth session token
- Token passed in Authorization header
- Only authenticated artists can edit their own portfolio

## API Endpoint

**PUT** `/api/artists/[artist_id]/portfolio`

**Request Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Request Body:**
```typescript
{
  artist_name: string;
  artist_name_eng: string;
  introduction: string;
  photo: string; // URL to image
  instagram: string;
  twitter: string;
  youtube: string;
  choreography: ChoreographyItem[];
  media: MediaItem[];
}
```

**Response:**
```typescript
{
  success: true
}
```

## Known Limitations

1. **Add New Items**: The "추가" (Add) buttons are present but not yet functional. Future implementation needed for:
   - Adding new choreography items
   - Adding new media items

2. **Choreography Deletion**: When a choreography item is removed, only the `dancer_choreo` relationship is deleted, not the underlying `song` record.

3. **Image Upload Size**: No client-side validation for image size. Relies on Supabase Storage limits.

4. **Concurrent Edits**: No conflict resolution if the same portfolio is edited by multiple users simultaneously.

5. **Undo/Redo**: No undo functionality. Changes are final once saved.

## Troubleshooting

### "포트폴리오를 불러올 수 없습니다"
- Check that user is logged in as an artist
- Verify `artistUser.artist_id` exists
- Check API endpoint is accessible

### Image Upload Fails
- Verify storage bucket `artist-images` exists
- Check bucket is set to public
- Verify storage policies are set correctly
- Check file size is within limits

### Save Fails
- Check browser console for errors
- Verify auth token is valid
- Check Supabase RLS policies
- Ensure artist_id matches logged-in user

### Changes Not Appearing
- Hard refresh the page (Cmd/Ctrl + Shift + R)
- Check if save was successful
- Verify no JavaScript errors in console

## Future Enhancements

1. **Add New Items Modal**
   - Search/add choreography from song database
   - Add new media items with YouTube URL

2. **Bulk Operations**
   - Select multiple items
   - Bulk highlight/unhighlight
   - Bulk delete

3. **Rich Text Editor**
   - Formatted introduction text
   - Markdown support

4. **Image Cropping**
   - Crop profile images before upload
   - Aspect ratio enforcement

5. **Unsaved Changes Warning**
   - Warn before leaving page with unsaved changes
   - Confirm dialog on cancel

6. **Preview Mode**
   - Toggle between edit and preview
   - See changes before saving

## Support

For issues or questions:
- Check console for error messages
- Verify database structure matches expected schema
- Ensure all Supabase policies are correctly set
- Review API endpoint logs for errors
