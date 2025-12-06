import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/portfolio/create - Create a new artist portfolio
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artist_id, name, phone, birth } = body

    if (!artist_id || !name) {
      return NextResponse.json(
        { error: 'artist_id and name are required' },
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

    // Get user email from auth
    const email = user.email
    if (!email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 400 })
    }

    // Call the database function to create portfolio
    const { data, error } = await supabase.rpc('create_new_artist_portfolio', {
      p_auth_id: user.id,
      p_artist_id: artist_id,
      p_name: name,
      p_email: email,
      p_phone: phone || null,
      p_birth: birth || null,
    })

    if (error) {
      console.error('Error creating portfolio:', error)

      // Check for specific error messages
      if (error.message.includes('already has a portfolio')) {
        return NextResponse.json(
          { error: 'You already have a portfolio' },
          { status: 400 }
        )
      }
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: 'This Artist ID is already taken. Please choose another one.' },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to create portfolio' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      artist_id: artist_id,
      message: 'Portfolio created successfully',
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/portfolio/create:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
