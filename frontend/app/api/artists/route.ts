import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get('limit');
    const searchQuery = searchParams.get('q');

    let query = supabase
      .from('artist_portfolio')
      .select('artist_id, artist_name, artist_name_eng, photo')
      .neq('is_hidden', true)
      ;

    // Add search filter if query provided
    if (searchQuery) {
      query = query.or(`artist_name.ilike.%${searchQuery}%,artist_name_eng.ilike.%${searchQuery}%`);
    }

    if (limit) {
      const limitNum = parseInt(limit, 10);
      if (!isNaN(limitNum) && limitNum > 0) {
        query = query.limit(limitNum);
      }
    } else if (searchQuery) {
      // Default limit for search results
      query = query.limit(10);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Format data to match the Artist type expected by the frontend
    const artists = data?.map(artist => ({
      artist_id: artist.artist_id,
      artist_name: artist.artist_name,
      artist_name_eng: artist.artist_name_eng,
      photo: artist.photo,
      introduction: null,
      instagram: null,
      twitter: null,
      youtube: null,
    })) || [];

    return NextResponse.json({
      artists,
      count: artists.length,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch artists' },
      { status: 500 }
    );
  }
}
