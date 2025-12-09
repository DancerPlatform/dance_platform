import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  try {
    const { group_id } = await params;
    const body = await request.json();
    const { awards } = body;

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

    // Update awards
    if (awards && Array.isArray(awards)) {
      // Delete all existing awards
      await authClient
        .from('team_award')
        .delete()
        .eq('team_id', group_id);

      // Insert new awards with display_order
      for (let index = 0; index < awards.length; index++) {
        const award = awards[index];
        await authClient.from('team_award').insert({
          team_id: group_id,
          award_title: award.award_title,
          issuing_org: award.issuing_org,
          received_date: award.received_date,
          display_order: index,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating awards:', error);
    return NextResponse.json(
      { error: 'Failed to update awards' },
      { status: 500 }
    );
  }
}
