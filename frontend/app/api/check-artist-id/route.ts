import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const artistId = searchParams.get('artist_id')

  if (!artistId) {
    return NextResponse.json(
      { error: 'artist_id is required' },
      { status: 400 }
    )
  }

  try {
    // Check if artist_id already exists in artist_user table
    const { data, error } = await supabase
      .from('artist_user')
      .select('artist_id')
      .eq('artist_id', artistId)
      .single()

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the "no rows returned" error code, which means ID is available
      console.error('Error checking artist_id:', error)
      return NextResponse.json(
        { error: 'Failed to check artist_id availability' },
        { status: 500 }
      )
    }

    // If data exists, the ID is taken
    const isAvailable = !data

    return NextResponse.json({
      available: isAvailable,
      artist_id: artistId,
    })
  } catch (error) {
    console.error('Error checking artist_id:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
