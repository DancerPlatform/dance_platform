import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST /api/claims/[claim_id]/reject - Reject a claim request (admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { claim_id: string } }
) {
  try {
    const { claim_id } = params
    const body = await request.json()
    const { reason } = body

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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
    }

    // Call the reject function
    const { data, error } = await supabase.rpc('reject_portfolio_claim', {
      p_claim_id: claim_id,
      p_admin_auth_id: user.id,
      p_reason: reason || null,
    })

    if (error) {
      console.error('Error rejecting claim:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Check if the function returned an error
    if (data && typeof data === 'object' && 'success' in data) {
      if (!data.success) {
        return NextResponse.json({ error: data.error }, { status: 400 })
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Portfolio claim rejected',
      data,
    })
  } catch (error) {
    console.error('Error in POST /api/claims/[claim_id]/reject:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
