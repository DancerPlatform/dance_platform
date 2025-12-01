import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
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
        .from('dancer_award')
        .delete()
        .eq('artist_id', artist_id);

      // Insert new awards
      for (const award of awards) {
        await authClient.from('dancer_award').insert({
          artist_id,
          award_title: award.award_title,
          issuing_org: award.issuing_org,
          received_date: award.received_date,
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
