import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/claims - Get all claim requests (for admins) or user's own claims
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // optional filter by status

    // Get the auth header
    const authHeader = request.headers.get('authorization')
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get the user from the token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabase.auth.getUser(token)

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    console.log("user: ", user.id)

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single()

    console.log('[Profile]: ', profile)

    let query = supabase
      .from('portfolio_claim_requests')
      .select(`
        *,
        artist_user!portfolio_claim_requests_artist_id_fkey (
          artist_id,
          name,
          email,
          phone,
          birth,
          auth_id
        )
      `)
      .order('created_at', { ascending: false })

    // If admin, show all claims; otherwise show only user's claims
    // if (!profile?.is_admin) {
    //   query = query.eq('requester_auth_id', user.id)
    // }

    // Optional status filter
    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching claims:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ claims: data, is_admin: profile?.is_admin || false })
  } catch (error) {
    console.error('Error in GET /api/claims:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/claims - Create a new claim request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artist_id, requester_phone } = body

    if (!artist_id) {
      return NextResponse.json({ error: 'artist_id is required' }, { status: 400 })
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

    // Check if artist portfolio exists and is unclaimed
    const { data: artist, error: artistError } = await supabase
      .from('artist_user')
      .select('artist_id, name, email, phone, auth_id')
      .eq('artist_id', artist_id)
      .single()

    if (artistError || !artist) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    if (artist.auth_id) {
      return NextResponse.json({ error: 'Portfolio is already claimed' }, { status: 400 })
    }

    // Check for existing pending claim for this portfolio
    const { data: existingClaim } = await supabase
      .from('portfolio_claim_requests')
      .select('claim_id, status')
      .eq('artist_id', artist_id)
      .eq('status', 'pending')
      .single()

    if (existingClaim) {
      return NextResponse.json(
        { error: 'There is already a pending claim for this portfolio' },
        { status: 400 }
      )
    }

    // Note: Users CAN claim a new portfolio even if they already have one
    // Upon approval, their account will be switched to the new portfolio

    // Calculate match scores
    const emailMatches = artist.email?.toLowerCase() === user.email?.toLowerCase()
    const phoneMatches = requester_phone && artist.phone
      ? artist.phone.replace(/\D/g, '') === requester_phone.replace(/\D/g, '')
      : null

    // Create claim request
    const { data: claim, error: claimError } = await supabase
      .from('portfolio_claim_requests')
      .insert({
        artist_id,
        requester_auth_id: user.id,
        requester_email: user.email!,
        requester_phone: requester_phone || null,
        email_matches: emailMatches,
        phone_matches: phoneMatches,
        status: 'pending',
      })
      .select()
      .single()

    if (claimError) {
      console.error('Error creating claim:', claimError)
      return NextResponse.json({ error: claimError.message }, { status: 500 })
    }

    return NextResponse.json({
      claim,
      message: 'Claim request submitted successfully. Please wait for admin approval.'
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/claims:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
