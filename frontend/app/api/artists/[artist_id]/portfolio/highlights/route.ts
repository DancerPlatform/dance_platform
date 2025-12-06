import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: { artist_id: string } } // ← Promise 아님
) {
  try {
    const { artist_id } = params;
    const body = await request.json();
    const { highlights } = body;

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

    // Update highlight items
    if (highlights && Array.isArray(highlights)) {
      console.log(
        'API received highlights:',
        highlights.map((h: any) => ({
          source: h.source,
          highlight_id: h.highlight_id,
          title: h.title,
          display_order: h.display_order,
        }))
      );

      type ExistingHighlights = {
        highlight_id: any;
        role: any;
        highlight_display_order: number;
        title: any;
        video_date?: any;
        source: 'choreo' | 'media';
      };

      // select choreo highlight
      const { data: existingChoreoHighlights } = await authClient
        .from('dancer_choreo')
        .select('song_id, role, highlight_display_order')
        .eq('artist_id', artist_id)
        .eq('is_highlight', true);

      // select media highlight
      const { data: existingMediaHighlights } = await authClient
        .from('dancer_media')
        .select('media_id, role, highlight_display_order, title, video_date')
        .eq('artist_id', artist_id)
        .eq('is_highlight', true);

      const choreo: ExistingHighlights[] = (existingChoreoHighlights ?? []).map(
        (item: any) => ({
          highlight_id: item.song_id,
          role: item.role,
          highlight_display_order: item.highlight_display_order,
          title: null,
          video_date: null,
          source: 'choreo',
        })
      );

      const media: ExistingHighlights[] = (existingMediaHighlights ?? []).map(
        (item: any) => ({
          highlight_id: item.media_id,
          role: item.role,
          highlight_display_order: item.highlight_display_order,
          title: item.title,
          video_date: item.video_date,
          source: 'media',
        })
      );

      // join media + choreo highlights
      const existingHighlights: ExistingHighlights[] = [...choreo, ...media];

      console.log(
        'Existing highlights in DB:',
        existingHighlights.map(h => ({
          highlight_id: h.highlight_id,
          display_order: h.highlight_display_order,
          source: h.source,
        }))
      );

      // highlight_display_order update
      for (let i = 0; i < highlights.length; i++) {
        const item = highlights[i];

        if (!item.highlight_id) {
          console.warn('highlight_id가 없는 highlight. 스킵:', item);
          continue;
        }

        // media highlight update
        if (item.source === 'media') {
          console.log(
            `Updating media (media_id=${item.highlight_id}) with highlight_display_order ${i}`
          );

          const { data: updateData, error: updateError } = await authClient
            .from('dancer_media')
            .update({
              youtube_link: item.youtube_link,
              role: item.role || null,
              is_highlight: item.is_highlight ?? true,
              display_order: item.display_order,
              highlight_display_order: i,
              title: item.title || null,
              video_date: item.video_date || null,
            })
            .eq('media_id', item.highlight_id)
            .select();

          if (updateError) {
            console.error(
              `Error updating media_id ${item.highlight_id}:`,
              updateError
            );
          } else {
            console.log(
              `Successfully updated media_id ${item.highlight_id}, returned:`,
              updateData
            );
          }
        }

        // choreo highlight update
        if (item.source === 'choreo') {
          console.log(
            `Updating choreo (song_id=${item.highlight_id}) with highlight_display_order ${i}`
          );

          const { data: updateData, error: updateError } = await authClient
            .from('dancer_choreo') // 이름 통일
            .update({
              role: item.role || null,
              is_highlight: item.is_highlight ?? true,
              display_order: i,
              highlight_display_order: i,
            })
            .eq('song_id', item.highlight_id)
            .select();

          if (updateError) {
            console.error(
              `Error updating choreo song_id ${item.highlight_id}:`,
              updateError
            );
          } else {
            console.log(
              `Successfully updated choreo song_id ${item.highlight_id}, returned:`,
              updateData
            );
          }
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating highlights:', error);
    return NextResponse.json(
      { error: 'Failed to update highlights' },
      { status: 500 }
    );
  }
}
