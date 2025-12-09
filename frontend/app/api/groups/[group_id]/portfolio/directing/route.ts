import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  try {
    const { group_id } = await params;
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
      // Get existing directing relationships for this team
      const { data: existingDirecting } = await authClient
        .from('team_directing')
        .select('directing_id')
        .eq('team_id', group_id) as { data: Array<{ directing_id: string }> | null };

      const existingDirIds = new Set(
        existingDirecting?.map((item) => item.directing_id) || []
      );
      const processedDirIds = new Set<string>();

      // Process each directing item with display_order
      for (let index = 0; index < directing.length; index++) {
        const item = directing[index];
        if (item.directing && item.directing.title) {
          // Check if this directing title already exists in the directing table
          const { data: existingDirInTable } = await authClient
            .from('directing')
            .select('directing_id')
            .eq('title', item.directing.title)
            .single();

          let dirId: string;

          if (existingDirInTable) {
            // Use the existing directing_id from the directing table
            dirId = existingDirInTable.directing_id;
          } else {
            // Create new directing entry
            dirId = `dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            await authClient.from('directing').insert({
              directing_id: dirId,
              title: item.directing.title,
              date: item.directing.date,
            });
          }

          // Create or update relationship with display_order
          if (!existingDirIds.has(dirId)) {
            await authClient.from('team_directing').insert({
              team_id: group_id,
              directing_id: dirId,
              display_order: index,
            });
          } else {
            // Update display_order if relationship already exists
            await authClient
              .from('team_directing')
              .update({ display_order: index })
              .eq('team_id', group_id)
              .eq('directing_id', dirId);
          }

          processedDirIds.add(dirId);
        }
      }

      // Delete relationships that were removed (only from team_directing)
      for (const existing of existingDirecting || []) {
        if (!processedDirIds.has(existing.directing_id)) {
          await authClient
            .from('team_directing')
            .delete()
            .eq('team_id', group_id)
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
