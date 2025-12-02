import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const keyword = searchParams.get('keyword') || '';
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (!type) {
      return NextResponse.json(
        { error: 'Type parameter is required' },
        { status: 400 }
      );
    }

    let results;
    let totalCount = 0;

    switch (type) {
      case 'dancer':
        // Search for dancers from artist_portfolio
        let dancerQuery = supabase
          .from('artist_portfolio')
          .select('*', { count: 'exact' });

        // Only apply keyword filter if keyword is provided
        if (keyword.trim()) {
          dancerQuery = dancerQuery.ilike('artist_name', `%${keyword}%`);
        }

        const { data: dancers, error: dancerError, count: dancerCount } = await dancerQuery
          .range(offset, offset + limit - 1);

        if (dancerError) {
          return NextResponse.json(
            { error: dancerError.message },
            { status: 500 }
          );
        }

        results = dancers;
        totalCount = dancerCount || 0;
        break;

      case 'crew':
        // Search for crews from team_portfolio
        let crewQuery = supabase
          .from('team_portfolio')
          .select('*', { count: 'exact' });

        // Only apply keyword filter if keyword is provided
        if (keyword.trim()) {
          crewQuery = crewQuery.ilike('team_name', `%${keyword}%`);
        }

        const { data: crews, error: crewError, count: crewCount } = await crewQuery
          .range(offset, offset + limit - 1);

        if (crewError) {
          return NextResponse.json(
            { error: crewError.message },
            { status: 500 }
          );
        }

        // For each crew, fetch member count and leader info
        const crewsWithDetails = await Promise.all(
          (crews || []).map(async (crew) => {
            // Get member count
            const { count: memberCount } = await supabase
              .from('artist_team')
              .select('*', { count: 'exact', head: true })
              .eq('team_id', crew.team_id);

            // Get leader info with portfolio
            const { data: leaderData } = await supabase
              .from('artist_portfolio')
              .select('artist_name, photo')
              .eq('artist_id', crew.leader_id)
              .single();

            return {
              group_id: crew.team_id,
              group_name: crew.team_name,
              introduction: crew.team_introduction,
              photo: crew.photo || null,
              member_count: memberCount || 0,
              leader: leaderData || null,
            };
          })
        );

        results = crewsWithDetails;
        totalCount = crewCount || 0;
        break;

      case 'career':
        // If no keyword, fetch all artists
        if (!keyword.trim()) {
          const { data: allArtists, error: allArtistsError, count: allArtistsCount } = await supabase
            .from('artist_portfolio')
            .select('*', { count: 'exact' })
            .range(offset, offset + limit - 1);

          if (allArtistsError) {
            return NextResponse.json(
              { error: allArtistsError.message },
              { status: 500 }
            );
          }

          results = allArtists;
          totalCount = allArtistsCount || 0;
          break;
        }

        // Search for artists based on their portfolio records (workshops, awards, performances, choreography, media, directing)
        const careerTables = [
          { table: 'workshop', keyField: 'class_name', artistField: 'artist_id' },
          { table: 'dancer_award', keyField: 'award_title', artistField: 'artist_id' },
          { table: 'dancer_performance', keyField: 'performance_id', artistField: 'artist_id' },
          { table: 'dancer_choreo', keyField: 'song_id', artistField: 'artist_id' },
          { table: 'dancer_media', keyField: 'title', artistField: 'artist_id' },
          { table: 'dancer_directing', keyField: 'directing_id', artistField: 'artist_id' },
        ];

        // Collect all artist IDs from matching portfolio records
        const artistIdsSet = new Set<string>();

        for (const { table, keyField, artistField } of careerTables) {
          const { data } = await supabase
            .from(table)
            .select(artistField)
            .ilike(keyField, `%${keyword}%`);

          if (data) {
            data.forEach((record: any) => {
              artistIdsSet.add(record[artistField]);
            });
          }
        }

        // Also search in related tables (performance, song, directing) and get associated artists
        // Search in performance table
        const { data: performanceData } = await supabase
          .from('performance')
          .select('performance_id')
          .ilike('performance_title', `%${keyword}%`);

        if (performanceData) {
          for (const perf of performanceData) {
            const { data: artistPerfs } = await supabase
              .from('dancer_performance')
              .select('artist_id')
              .eq('performance_id', perf.performance_id);

            if (artistPerfs) {
              artistPerfs.forEach((ap: any) => artistIdsSet.add(ap.artist_id));
            }
          }
        }

        // Search in song table
        const { data: songData } = await supabase
          .from('song')
          .select('song_id')
          .or(`title.ilike.%${keyword}%,singer.ilike.%${keyword}%`);

        if (songData) {
          for (const song of songData) {
            const { data: artistChoreos } = await supabase
              .from('dancer_choreo')
              .select('artist_id')
              .eq('song_id', song.song_id);

            if (artistChoreos) {
              artistChoreos.forEach((ac: any) => artistIdsSet.add(ac.artist_id));
            }
          }
        }

        // Search in directing table
        const { data: directingData } = await supabase
          .from('directing')
          .select('directing_id')
          .ilike('title', `%${keyword}%`);

        if (directingData) {
          for (const directing of directingData) {
            const { data: artistDirectings } = await supabase
              .from('dancer_directing')
              .select('artist_id')
              .eq('directing_id', directing.directing_id);

            if (artistDirectings) {
              artistDirectings.forEach((ad: any) => artistIdsSet.add(ad.artist_id));
            }
          }
        }

        const artistIds = Array.from(artistIdsSet);
        totalCount = artistIds.length;

        // Get paginated artist portfolios
        const paginatedArtistIds = artistIds.slice(offset, offset + limit);

        if (paginatedArtistIds.length > 0) {
          const { data: artistPortfolios, error: careerError } = await supabase
            .from('artist_portfolio')
            .select('*')
            .in('artist_id', paginatedArtistIds);

          if (careerError) {
            return NextResponse.json(
              { error: careerError.message },
              { status: 500 }
            );
          }

          results = artistPortfolios || [];
        } else {
          results = [];
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid type. Must be "dancer", "crew", or "career"' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      results,
      total: totalCount,
      limit,
      offset,
      hasMore: offset + limit < totalCount,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Failed to perform search' },
      { status: 500 }
    );
  }
}
