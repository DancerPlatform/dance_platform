import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  try {
    const { group_id } = await params;
    const body = await request.json();

    const {
      artist_name,
      artist_name_eng,
      introduction,
      photo,
      instagram,
      twitter,
      youtube,
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

    // Update team portfolio info
    const { error: updateError } = await authClient
      .from('team_portfolio')
      .update({
        team_name: artist_name,
        team_introduction: introduction,
        photo,
        instagram,
        twitter,
        youtube,
      })
      .eq('team_id', group_id);

    if (updateError) {
      console.error('Error updating team profile:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
