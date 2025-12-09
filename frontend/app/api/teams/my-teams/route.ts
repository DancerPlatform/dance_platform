import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    const artistId = artistUser.artist_id;

    // Fetch all teams this artist is a member of
    const { data: teamMemberships, error: membershipsError } = await supabase
      .from('artist_team')
      .select('team_id')
      .eq('artist_id', artistId);

    if (membershipsError) {
      console.error('Error fetching team memberships:', membershipsError);
      return NextResponse.json(
        { error: 'Failed to fetch team memberships' },
        { status: 500 }
      );
    }

    if (!teamMemberships || teamMemberships.length === 0) {
      return NextResponse.json({ teams: [] });
    }

    // Fetch team details for each team
    const teamIds = teamMemberships.map((m) => m.team_id);
    const { data: teams, error: teamsError } = await supabase
      .from('team_portfolio')
      .select('team_id, team_name, photo, team_introduction, leader_id, subleader_id')
      .in('team_id', teamIds);

    if (teamsError) {
      console.error('Error fetching teams:', teamsError);
      return NextResponse.json(
        { error: 'Failed to fetch teams' },
        { status: 500 }
      );
    }

    // Add role information for each team
    const teamsWithRole = teams?.map((team) => ({
      ...team,
      role: team.leader_id === artistId
        ? 'leader'
        : team.subleader_id === artistId
        ? 'subleader'
        : 'member',
    })) || [];

    return NextResponse.json({ teams: teamsWithRole });
  } catch (error) {
    console.error('Error in my-teams route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
