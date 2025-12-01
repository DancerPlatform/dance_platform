import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();
    const { performances } = body;

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

    // Update performances
    if (performances && Array.isArray(performances)) {
      // Get existing performance relationships
      const { data: existingPerformances } = await authClient
        .from('dancer_performance')
        .select('performance_id')
        .eq('artist_id', artist_id);

      const existingPerfIds = new Set(
        existingPerformances?.map((item) => item.performance_id) || []
      );
      const processedPerfIds = new Set<string>();

      // Insert or reuse performances
      for (const item of performances) {
        if (item.performance) {
          let perfId = item.performance_id;

          // If this performance already exists in the relationship, keep it
          if (perfId && existingPerfIds.has(perfId)) {
            processedPerfIds.add(perfId);
          } else if (!perfId) {
            // Create new performance
            perfId = `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await authClient.from('performance').insert({
              performance_id: perfId,
              performance_title: item.performance.performance_title,
              date: item.performance.date,
              category: item.performance.category || null,
            });

            // Create relationship
            await authClient.from('dancer_performance').insert({
              artist_id,
              performance_id: perfId,
            });
            processedPerfIds.add(perfId);
          }
        }
      }

      // Delete relationships that were removed
      for (const existing of existingPerformances || []) {
        if (!processedPerfIds.has(existing.performance_id)) {
          await authClient
            .from('dancer_performance')
            .delete()
            .eq('artist_id', artist_id)
            .eq('performance_id', existing.performance_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating performances:', error);
    return NextResponse.json(
      { error: 'Failed to update performances' },
      { status: 500 }
    );
  }
}
