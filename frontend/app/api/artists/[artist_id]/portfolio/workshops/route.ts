import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();
    const { workshops } = body;

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

    // Update workshops
    if (workshops && Array.isArray(workshops)) {
      // Delete all existing workshops
      await authClient
        .from('workshop')
        .delete()
        .eq('artist_id', artist_id);

      // Insert new workshops
      for (const workshop of workshops) {
        await authClient.from('workshop').insert({
          artist_id,
          class_name: workshop.class_name,
          class_date: workshop.class_date,
          country: workshop.country,
          class_role: workshop.class_role || null,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating workshops:', error);
    return NextResponse.json(
      { error: 'Failed to update workshops' },
      { status: 500 }
    );
  }
}
