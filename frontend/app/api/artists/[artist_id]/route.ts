import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { fetchYouTubeMetadata } from '@/lib/youtube';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;

    // Fetch basic artist portfolio info
    const { data: artistData, error: artistError } = await supabase
      .from('artist_portfolio')
      .select('*')
      .eq('artist_id', artist_id)
      .single();

    if (artistError) {
      return NextResponse.json(
        { error: artistError.message },
        { status: 404 }
      );
    }

    // Fetch workshops
    const { data: workshops, error: workshopsError } = await supabase
      .from('workshop')
      .select('*')
      .eq('artist_id', artist_id);

    if (workshopsError) console.error('Workshops error:', workshopsError);

    // Fetch awards
    const { data: awards, error: awardsError } = await supabase
      .from('dancer_award')
      .select('*')
      .eq('artist_id', artist_id);

    if (awardsError) console.error('Awards error:', awardsError);

    // Fetch choreography with song info
    const { data: choreography, error: choreoError } = await supabase
      .from('dancer_choreo')
      .select(`
        role,
        display_order,
        is_highlight,
        highlight_display_order,
        song:song_id (
          song_id,
          title,
          singer,
          date,
          youtube_link
        )
      `)
      .eq('artist_id', artist_id)
      .order('display_order', { ascending: true });

    if (choreoError) console.error('Choreography error:', choreoError);

    // Fetch media
    const { data: media, error: mediaError } = await supabase
      .from('dancer_media')
      .select('*')
      .eq('artist_id', artist_id)
      .order('display_order', { ascending: true });

    if (mediaError) console.error('Media error:', mediaError);

    // Enrich media with YouTube metadata if title or video_date is missing
    const enrichedMedia = await Promise.all(
      (media || []).map(async (item) => {
        // Only fetch metadata if title or video_date is missing
        if ((!item.title || !item.video_date) && item.youtube_link) {
          const metadata = await fetchYouTubeMetadata(item.youtube_link);
          if (metadata) {
            // Update the database with the fetched metadata
            const updates: any = {};
            if (!item.title && metadata.title) {
              updates.title = metadata.title;
            }
            if (!item.video_date && metadata.publishDate) {
              updates.video_date = metadata.publishDate;
            }

            if (Object.keys(updates).length > 0) {
              await supabase
                .from('dancer_media')
                .update(updates)
                .eq('media_id', item.media_id);

              return { ...item, ...updates };
            }
          }
        }
        return item;
      })
    );

    // Fetch performances
    const { data: performances, error: performancesError } = await supabase
      .from('dancer_performance')
      .select(`
        performance:performance_id (
          performance_id,
          performance_title,
          date,
          category
        )
      `)
      .eq('artist_id', artist_id);

    if (performancesError) console.error('Performances error:', performancesError);

    // Fetch directing work
    const { data: directing, error: directingError } = await supabase
      .from('dancer_directing')
      .select(`
        directing:directing_id (
          directing_id,
          title,
          date
        )
      `)
      .eq('artist_id', artist_id);

    if (directingError) console.error('Directing error:', directingError);

    // Fetch team information
    const { data: teamMemberships, error: teamError } = await supabase
      .from('artist_team')
      .select(`
        team:team_id (
          team_id,
          team_name,
          team_introduction,
          leader:leader_id (
            artist_id,
            name
          ),
          subleader:subleader_id (
            artist_id,
            name
          )
        )
      `)
      .eq('artist_id', artist_id);

    if (teamError) console.error('Team error:', teamError);

    // Log data counts for debugging
    console.log('Data counts:', {
      workshops: workshops?.length || 0,
      awards: awards?.length || 0,
      choreography: choreography?.length || 0,
      media: enrichedMedia?.length || 0,
      performances: performances?.length || 0,
      directing: directing?.length || 0,
      teams: teamMemberships?.length || 0,
    });

    // Combine all portfolio data
    const portfolio = {
      ...artistData,
      workshops: workshops || [],
      awards: awards || [],
      choreography: choreography || [],
      media: enrichedMedia || [],
      performances: performances || [],
      directing: directing || [],
      teams: teamMemberships || [],
    };

    return NextResponse.json(portfolio);
  } catch (error) {
    console.error('Error fetching artist portfolio:', error);
    return NextResponse.json(
      { error: 'Failed to fetch artist portfolio' },
      { status: 500 }
    );
  }
}
