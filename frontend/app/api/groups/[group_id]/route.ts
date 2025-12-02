import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  try {
    const { group_id } = await params;

    // Fetch basic team info from team_portfolio
    const { data: teamData, error: teamError } = await supabase
      .from('team_portfolio')
      .select('*')
      .eq('team_id', group_id)
      .single();

    if (teamError) {
      return NextResponse.json(
        { error: teamError.message },
        { status: 404 }
      );
    }

    // Fetch team members with their portfolio info
    const { data: memberIds, error: membersError } = await supabase
      .from('artist_team')
      .select('artist_id')
      .eq('team_id', group_id);

    if (membersError) {
      console.error('Members error:', membersError);
      return NextResponse.json(
        { error: 'Failed to fetch team members' },
        { status: 500 }
      );
    }

    // Fetch full details for each member
    const members = await Promise.all(
      (memberIds || []).map(async ({ artist_id }) => {
        const { data: artistData } = await supabase
          .from('artist_user')
          .select('*')
          .eq('artist_id', artist_id)
          .single();

        const { data: portfolioData } = await supabase
          .from('artist_portfolio')
          .select('*')
          .eq('artist_id', artist_id)
          .single();

        return {
          artist_id,
          is_leader: artist_id === teamData.leader_id,
          joined_date: null, // artist_team doesn't have joined_date
          artist: artistData,
          portfolio: portfolioData,
        };
      })
    );

    // Sort members: leader first, then others
    const sortedMembers = members.sort((a, b) => {
      if (a.is_leader) return -1;
      if (b.is_leader) return 1;
      return 0;
    });

    // Combine team data with members
    const teamWithMembers = {
      group_id: teamData.team_id,
      group_name: teamData.team_name,
      introduction: teamData.team_introduction,
      photo: teamData.photo,
      instagram: teamData.instagram,
      twitter: teamData.twitter,
      youtube: teamData.youtube,
      members: sortedMembers,
    };

    return NextResponse.json(teamWithMembers);
  } catch (error) {
    console.error('Error fetching team:', error);
    return NextResponse.json(
      { error: 'Failed to fetch team' },
      { status: 500 }
    );
  }
}
