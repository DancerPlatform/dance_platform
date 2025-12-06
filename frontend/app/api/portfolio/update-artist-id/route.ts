import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH /api/portfolio/update-artist-id - Update artist_id (one-time only)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { old_artist_id, new_artist_id } = body

    if (!old_artist_id || !new_artist_id) {
      return NextResponse.json(
        { error: 'old_artist_id and new_artist_id are required' },
        { status: 400 }
      )
    }

    // Get the auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Call the database function to update artist_id
    const { data, error } = await supabase.rpc('update_artist_id', {
      p_auth_id: user.id,
      p_old_artist_id: old_artist_id,
      p_new_artist_id: new_artist_id,
    })

    if (error) {
      console.error('Error updating artist_id:', error)

      // Check for specific error messages
      if (error.message.includes('can only be changed once')) {
        return NextResponse.json(
          { error: 'Artist ID can only be changed once. You have already used your one-time change.' },
          { status: 400 }
        )
      }
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This Artist ID is already taken. Please choose another one.' },
          { status: 400 }
        )
      }
      if (error.message.includes('not found') || error.message.includes('does not have permission')) {
        return NextResponse.json(
          { error: 'Portfolio not found or you do not have permission to edit it.' },
          { status: 403 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to update artist ID' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      old_artist_id: old_artist_id,
      new_artist_id: new_artist_id,
      message: 'Artist ID updated successfully. This was your one-time change.',
    })
  } catch (error) {
    console.error('Error in PATCH /api/portfolio/update-artist-id:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
