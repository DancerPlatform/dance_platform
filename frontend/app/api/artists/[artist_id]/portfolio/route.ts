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
      performances,
      directing,
      workshops,
      awards,
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
      const { data: existingChoreo } = await authClient
        .from('dancer_choreo')
        .select('song_id, role, is_highlight, display_order')
        .eq('artist_id', artist_id);

      const existingSongIds = new Set(
        existingChoreo?.map((item) => item.song_id) || []
      );

      // Track processed songs
      const processedSongs = new Set<string>();

      for (let i = 0; i < choreography.length; i++) {
        const item = choreography[i];
        if (item.song?.song_id && existingSongIds.has(item.song.song_id)) {
          // Update existing item with correct order
          processedSongs.add(item.song.song_id);
          await authClient
            .from('dancer_choreo')
            .update({
              role: item.role || [],
              is_highlight: item.is_highlight || false,
              display_order: i,
            })
            .eq('artist_id', artist_id)
            .eq('song_id', item.song.song_id);
        } else if (item.song && !item.song.song_id) {
          // New choreography - insert song first, then relationship
          const songId = `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await authClient.from('song').insert({
            song_id: songId,
            title: item.song.title,
            singer: item.song.singer,
            date: item.song.date,
            youtube_link: item.song.youtube_link || null,
          });

          await authClient.from('dancer_choreo').insert({
            artist_id,
            song_id: songId,
            role: item.role || [],
            is_highlight: item.is_highlight || false,
            display_order: i,
          });
          processedSongs.add(songId);
        }
      }

      // Delete choreography relationships not in the new list
      for (const existing of existingChoreo || []) {
        if (!processedSongs.has(existing.song_id)) {
          await authClient
            .from('dancer_choreo')
            .delete()
            .eq('artist_id', artist_id)
            .eq('song_id', existing.song_id);
        }
      }
    }

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

    // Update performances
    if (performances && Array.isArray(performances)) {
      // Get existing performance relationships
      const { data: existingPerformances } = await authClient
        .from('dancer_performance')
        .select('performance_id')
        .eq('artist_id', artist_id);

      const existingPerfIds = new Set(
        existingPerformances?.map((item) => item.performance_id) || []
      );
      const processedPerfIds = new Set<string>();

      // Insert or reuse performances
      for (const item of performances) {
        if (item.performance) {
          let perfId = item.performance_id;

          // If this performance already exists in the relationship, keep it
          if (perfId && existingPerfIds.has(perfId)) {
            processedPerfIds.add(perfId);
          } else if (!perfId) {
            // Create new performance
            perfId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await authClient.from('performance').insert({
              performance_id: perfId,
              performance_title: item.performance.performance_title,
              date: item.performance.date,
              category: item.performance.category || null,
            });

            // Create relationship
            await authClient.from('dancer_performance').insert({
              artist_id,
              performance_id: perfId,
            });
            processedPerfIds.add(perfId);
          }
        }
      }

      // Delete relationships that were removed
      for (const existing of existingPerformances || []) {
        if (!processedPerfIds.has(existing.performance_id)) {
          await authClient
            .from('dancer_performance')
            .delete()
            .eq('artist_id', artist_id)
            .eq('performance_id', existing.performance_id);
        }
      }
    }

    // Update directing
    if (directing && Array.isArray(directing)) {
      // Get existing directing relationships
      const { data: existingDirecting } = await authClient
        .from('dancer_directing')
        .select('directing_id')
        .eq('artist_id', artist_id);

      const existingDirIds = new Set(
        existingDirecting?.map((item) => item.directing_id) || []
      );
      const processedDirIds = new Set<string>();

      // Insert or reuse directing
      for (const item of directing) {
        if (item.directing) {
          let dirId = item.directing_id;

          // If this directing already exists in the relationship, keep it
          if (dirId && existingDirIds.has(dirId)) {
            processedDirIds.add(dirId);
          } else if (!dirId) {
            // Create new directing
            dirId = `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await authClient.from('directing').insert({
              directing_id: dirId,
              title: item.directing.title,
              date: item.directing.date,
            });

            // Create relationship
            await authClient.from('dancer_directing').insert({
              artist_id,
              directing_id: dirId,
            });
            processedDirIds.add(dirId);
          }
        }
      }

      // Delete relationships that were removed
      for (const existing of existingDirecting || []) {
        if (!processedDirIds.has(existing.directing_id)) {
          await authClient
            .from('dancer_directing')
            .delete()
            .eq('artist_id', artist_id)
            .eq('directing_id', existing.directing_id);
        }
      }
    }

    // Update workshops
    if (workshops && Array.isArray(workshops)) {
      // Delete all existing workshops
      await authClient
        .from('workshop')
        .delete()
        .eq('artist_id', artist_id);

      // Insert new workshops
      for (const workshop of workshops) {
        await authClient.from('workshop').insert({
          artist_id,
          class_name: workshop.class_name,
          class_date: workshop.class_date,
          country: workshop.country,
          class_role: workshop.class_role || null,
        });
      }
    }

    // Update awards
    if (awards && Array.isArray(awards)) {
      // Delete all existing awards
      await authClient
        .from('dancer_award')
        .delete()
        .eq('artist_id', artist_id);

      // Insert new awards
      for (const award of awards) {
        await authClient.from('dancer_award').insert({
          artist_id,
          award_title: award.award_title,
          issuing_org: award.issuing_org,
          received_date: award.received_date,
        });
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
