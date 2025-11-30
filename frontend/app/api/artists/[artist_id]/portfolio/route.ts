import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();

    const {
      artist_name,
      artist_name_eng,
      introduction,
      photo,
      instagram,
      twitter,
      youtube,
      choreography,
      media,
    } = body;

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

    // Update basic artist portfolio info
    const { error: updateError } = await authClient
      .from('artist_portfolio')
      .update({
        artist_name,
        artist_name_eng,
        introduction,
        photo,
        instagram,
        twitter,
        youtube,
      })
      .eq('artist_id', artist_id);

    if (updateError) {
      console.error('Error updating artist portfolio:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Update choreography items
    if (choreography && Array.isArray(choreography)) {
      // Get existing choreography items
      const { data: existingChoreo } = await authClient
        .from('dancer_choreo')
        .select('song_id, role, is_highlight, display_order')
        .eq('artist_id', artist_id);

      const existingSongIds = new Set(
        existingChoreo?.map((item) => item.song_id) || []
      );

      // Update each choreography item that still exists
      for (const item of choreography) {
        if (item.song?.song_id && existingSongIds.has(item.song.song_id)) {
          // Update existing item
          await authClient
            .from('dancer_choreo')
            .update({
              role: item.role || [],
              is_highlight: item.is_highlight || false,
              display_order: item.display_order,
            })
            .eq('artist_id', artist_id)
            .eq('song_id', item.song.song_id);
        }
      }
    }

    // Update media items
    if (media && Array.isArray(media)) {
      // Get existing media items
      const { data: existingMedia } = await authClient
        .from('dancer_media')
        .select('*')
        .eq('artist_id', artist_id);

      if (existingMedia) {
        // Create a map of existing media by their media_id
        const existingMediaMap = new Map(
          existingMedia.map((item) => [item.media_id, item])
        );

        // Track which media_ids are in the new list
        const updatedMediaIds = new Set<string>();

        // Update or keep track of each media item
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
          }
        }

        // Delete items that were removed (not in the updated list)
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
    console.error('Error updating portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to update portfolio' },
      { status: 500 }
    );
  }
}
