import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    // Fetch teams from team_portfolio
    let query = supabase
      .from('team_portfolio')
      .select('*');

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data: teams, error: teamsError } = await query;

    if (teamsError) {
      console.error('Teams error:', teamsError);
      return NextResponse.json(
        { error: teamsError.message },
        { status: 500 }
      );
    }

    // For each team, fetch member count and leader info
    const teamsWithDetails = await Promise.all(
      (teams || []).map(async (team) => {
        // Get member count
        const { count } = await supabase
          .from('artist_team')
          .select('*', { count: 'exact', head: true })
          .eq('team_id', team.team_id);

        // Get leader info with portfolio
        const { data: leaderData } = await supabase
          .from('artist_portfolio')
          .select('artist_name, photo')
          .eq('artist_id', team.leader_id)
          .single();

        return {
          group_id: team.team_id,
          group_name: team.team_name,
          introduction: team.team_introduction,
          photo: team.photo || null,
          member_count: count || 0,
          leader: leaderData || null,
        };
      })
    );

    return NextResponse.json({ groups: teamsWithDetails });
  } catch (error) {
    console.error('Error fetching teams:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    );
  }
}
