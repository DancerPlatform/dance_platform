import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();
    const { images } = body;

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Create authenticated Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Update images
    if (images && Array.isArray(images)) {
      const { data: existingImages } = await authClient
        .from('artist_images')
        .select('*')
        .eq('artist_id', artist_id);

      if (existingImages) {
        const existingImageMap = new Map(
          existingImages.map((item) => [item.image_id, item])
        );
        const updatedImageIds = new Set<string>();

        for (let i = 0; i < images.length; i++) {
          const item = images[i];

          if (item.image_id && existingImageMap.has(item.image_id)) {
            // Update existing item
            updatedImageIds.add(item.image_id);
            await authClient
              .from('artist_images')
              .update({
                image_url: item.image_url,
                caption: item.caption || null,
                display_order: i,
              })
              .eq('image_id', item.image_id);
          } else if (!item.image_id) {
            // New image item
            await authClient.from('artist_images').insert({
              artist_id,
              image_url: item.image_url,
              caption: item.caption || null,
              display_order: i,
            });
          }
        }

        // Delete items that were removed
        for (const existingItem of existingImages) {
          if (!updatedImageIds.has(existingItem.image_id)) {
            await authClient
              .from('artist_images')
              .delete()
              .eq('image_id', existingItem.image_id);
          }
        }
      } else {
        // No existing images, insert all as new
        for (let i = 0; i < images.length; i++) {
          const item = images[i];
          await authClient.from('artist_images').insert({
            artist_id,
            image_url: item.image_url,
            caption: item.caption || null,
            display_order: i,
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating images:', error);
    return NextResponse.json(
      { error: 'Failed to update images' },
      { status: 500 }
    );
  }
}
