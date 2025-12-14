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

    // Fetch team members (basic info only)
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

    // Fetch basic member details (for display purposes only)
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
          .maybeSingle();

        return {
          artist_id,
          is_leader: artist_id === teamData.leader_id,
          is_subleader: artist_id === teamData.subleader_id,
          joined_date: null,
          artist: artistData,
          portfolio: {
            artist_id,
            artist_name: portfolioData?.artist_name || null,
            artist_name_eng: portfolioData?.artist_name_eng || null,
            photo: portfolioData?.photo || null,
          },
        };
      })
    );

    // Sort members: leader first, then others
    const sortedMembers = members.sort((a, b) => {
      if (a.is_leader) return -1;
      if (b.is_leader) return 1;
      return 0;
    });

    // Fetch team-specific portfolio data from team_ tables
    // Fetch team workshops
    const { data: teamWorkshops } = await supabase
      .from('team_workshop')
      .select('*')
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Fetch team awards
    const { data: teamAwards } = await supabase
      .from('team_award')
      .select('*')
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Fetch team choreography with song info
    const { data: teamChoreography } = await supabase
      .from('team_choreo')
      .select(`
        role,
        display_order,
        is_highlight,
        highlight_display_order,
        song:song_id (
          song_id,
          title,
          singer,
          date,
          youtube_link
        )
      `)
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Fetch team media
    const { data: teamMedia } = await supabase
      .from('team_media')
      .select('*')
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Fetch team performances
    const { data: teamPerformances } = await supabase
      .from('team_performance')
      .select(`
        display_order,
        performance:performance_id (
          performance_id,
          performance_title,
          date,
          category
        )
      `)
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Fetch team directing work
    const { data: teamDirecting } = await supabase
      .from('team_directing')
      .select(`
        display_order,
        directing:directing_id (
          directing_id,
          title,
          date
        )
      `)
      .eq('team_id', group_id)
      .order('display_order', { ascending: true });

    // Combine team data with members and team portfolio
    const teamWithMembers = {
      group_id: teamData.team_id,
      group_name: teamData.team_name,
      group_name_eng: teamData.team_name_eng || null,
      introduction: teamData.team_introduction,
      photo: teamData.photo,
      instagram: teamData.instagram,
      twitter: teamData.twitter,
      youtube: teamData.youtube,
      members: sortedMembers,
      // Add team portfolio data
      workshops: teamWorkshops || [],
      awards: teamAwards || [],
      choreography: teamChoreography || [],
      media: teamMedia || [],
      performances: teamPerformances || [],
      directing: teamDirecting || [],
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
