import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();
    const { media } = body;

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

    // Update media items
    if (media && Array.isArray(media)) {
      const { data: existingMedia } = await authClient
        .from('dancer_media')
        .select('*')
        .eq('artist_id', artist_id);

      if (existingMedia) {
        const existingMediaMap = new Map(
          existingMedia.map((item) => [item.media_id, item])
        );
        const updatedMediaIds = new Set<string>();

        for (let i = 0; i < media.length; i++) {
          const item = media[i];

          if (item.media_id && existingMediaMap.has(item.media_id)) {
            // Update existing item
            updatedMediaIds.add(item.media_id);
            await authClient
              .from('dancer_media')
              .update({
                youtube_link: item.youtube_link,
                role: item.role || null,
                is_highlight: item.is_highlight || false,
                display_order: i,
                title: item.title || null,
                video_date: item.video_date || null,
              })
              .eq('media_id', item.media_id);
          } else if (!item.media_id) {
            // New media item
            await authClient.from('dancer_media').insert({
              artist_id,
              youtube_link: item.youtube_link,
              role: item.role || null,
              is_highlight: item.is_highlight || false,
              display_order: i,
              title: item.title || null,
              video_date: item.video_date || null,
            });
          }
        }

        // Delete items that were removed
        for (const existingItem of existingMedia) {
          if (!updatedMediaIds.has(existingItem.media_id)) {
            await authClient
              .from('dancer_media')
              .delete()
              .eq('media_id', existingItem.media_id);
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}
