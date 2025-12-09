import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  try {
    const { group_id } = await params;
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
      console.log('API received media:', media.map(m => ({ media_id: m.media_id, title: m.title, display_order: m.display_order })));

      const { data: existingMedia } = await authClient
        .from('team_media')
        .select('*')
        .eq('team_id', group_id);

      console.log('Existing media in DB:', existingMedia?.map(m => ({ media_id: m.media_id, title: m.title, display_order: m.display_order })));

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
            console.log(`Updating media_id ${item.media_id} with display_order ${i}`);
            const { data: updateData, error: updateError } = await authClient
              .from('team_media')
              .update({
                youtube_link: item.youtube_link,
                role: item.role || null,
                is_highlight: item.is_highlight || false,
                display_order: i,
                title: item.title || null,
                video_date: item.video_date || null,
              })
              .eq('media_id', item.media_id)
              .select();
            if (updateError) {
              console.error(`Error updating media_id ${item.media_id}:`, updateError);
            } else {
              console.log(`Successfully updated media_id ${item.media_id}, returned:`, updateData);
            }
          } else if (!item.media_id) {
            // New media item
            await authClient.from('team_media').insert({
              team_id: group_id,
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
              .from('team_media')
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
