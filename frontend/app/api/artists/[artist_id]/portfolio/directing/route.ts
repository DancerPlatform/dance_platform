import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }
) {
  try {
    const { artist_id } = await params;
    const body = await request.json();
    const { directing } = body;

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

    // Update directing
    if (directing && Array.isArray(directing)) {
      // Get existing directing relationships
      const { data: existingDirecting } = await authClient
        .from('dancer_directing')
        .select('directing_id')
        .eq('artist_id', artist_id);

      const existingDirIds = new Set(
        existingDirecting?.map((item) => item.directing_id) || []
      );
      const processedDirIds = new Set<string>();

      // Insert or reuse directing
      for (const item of directing) {
        if (item.directing) {
          let dirId = item.directing_id;

          // If this directing already exists in the relationship, keep it
          if (dirId && existingDirIds.has(dirId)) {
            processedDirIds.add(dirId);
          } else if (!dirId) {
            // Create new directing
            dirId = `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await authClient.from('directing').insert({
              directing_id: dirId,
              title: item.directing.title,
              date: item.directing.date,
            });

            // Create relationship
            await authClient.from('dancer_directing').insert({
              artist_id,
              directing_id: dirId,
            });
            processedDirIds.add(dirId);
          }
        }
      }

      // Delete relationships that were removed
      for (const existing of existingDirecting || []) {
        if (!processedDirIds.has(existing.directing_id)) {
          await authClient
            .from('dancer_directing')
            .delete()
            .eq('artist_id', artist_id)
            .eq('directing_id', existing.directing_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating directing:', error);
    return NextResponse.json(
      { error: 'Failed to update directing' },
      { status: 500 }
    );
  }
}
