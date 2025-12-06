import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/portfolio/search - Search for unclaimed portfolios
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Search query must be at least 2 characters' },
        { status: 400 }
      )
    }

    // Search for unclaimed portfolios (auth_id is null)
    const { data, error } = await supabase
      .from('artist_user')
      .select(`
        artist_id,
        name,
        email,
        phone,
        auth_id,
        portfolio:artist_portfolio(
          artist_name,
          artist_name_eng,
          photo
        )
      `)
      .is('auth_id', null)
      .or(`artist_id.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(20)

    if (error) {
      console.error('Error searching portfolios:', error)
      return NextResponse.json(
        { error: 'Failed to search portfolios' },
        { status: 500 }
      )
    }

    // Format the response
    const portfolios = data.map((artist: any) => ({
      artist_id: artist.artist_id,
      name: artist.name,
      artist_name: artist.portfolio?.artist_name || artist.name,
      artist_name_eng: artist.portfolio?.artist_name_eng,
      photo: artist.portfolio?.photo,
      email: artist.email,
      phone: artist.phone,
    }))

    return NextResponse.json({ portfolios })
  } catch (error) {
    console.error('Error in GET /api/portfolio/search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
