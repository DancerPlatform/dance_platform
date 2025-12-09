import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the auth header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get request body
    const body = await request.json();
    const {
      team_id,
      team_name,
      team_introduction,
      photo,
      instagram,
      twitter,
      youtube,
    } = body;

    // Validate required fields
    if (!team_id || !team_name) {
      return NextResponse.json(
        { error: 'team_id and team_name are required' },
        { status: 400 }
      );
    }

    // Get the artist_id of the current user
    const { data: artistUser, error: artistError } = await supabase
      .from('artist_user')
      .select('artist_id')
      .eq('auth_id', user.id)
      .single();

    if (artistError || !artistUser) {
      return NextResponse.json(
        { error: 'Artist profile not found' },
        { status: 404 }
      );
    }

    const leader_id = artistUser.artist_id;

    // Check if team_id already exists
    const { data: existingTeam } = await supabase
      .from('team_portfolio')
      .select('team_id')
      .eq('team_id', team_id)
      .single();

    if (existingTeam) {
      return NextResponse.json(
        { error: 'Team ID already exists' },
        { status: 409 }
      );
    }

    // Create team_portfolio entry
    const { data: teamPortfolio, error: portfolioError } = await supabase
      .from('team_portfolio')
      .insert({
        team_id,
        team_name,
        team_introduction: team_introduction || null,
        leader_id,
        subleader_id: null,
        photo: photo || null,
        instagram: instagram || null,
        twitter: twitter || null,
        youtube: youtube || null,
      })
      .select()
      .single();

    if (portfolioError) {
      console.error('Error creating team portfolio:', portfolioError);
      return NextResponse.json(
        { error: 'Failed to create team portfolio', details: portfolioError.message },
        { status: 500 }
      );
    }

    // Create artist_team mapping (add creator as team member)
    const { error: teamMemberError } = await supabase
      .from('artist_team')
      .insert({
        artist_id: leader_id,
        team_id,
      });

    if (teamMemberError) {
      console.error('Error creating team member mapping:', teamMemberError);
      // Rollback: delete the team_portfolio entry
      await supabase
        .from('team_portfolio')
        .delete()
        .eq('team_id', team_id);

      return NextResponse.json(
        { error: 'Failed to create team member mapping', details: teamMemberError.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        team: teamPortfolio,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in team creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
