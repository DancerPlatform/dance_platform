import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ group_id: string }> }
) {
  const { group_id } = await params;
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { artist_ids } = await req.json();

  if (!Array.isArray(artist_ids) || artist_ids.length === 0) {
    return NextResponse.json({ error: 'artist_ids must be a non-empty array' }, { status: 400 });
  }

  try {
    console.log(group_id)

    artist_ids.forEach(async (id) => {
      const { data, error } = await supabase
        .from('artist_team')
        .insert({artist_id: id, team_id:group_id})
        
        if (error) {
          console.error('Error adding members to team:', error);
          if (error.code === '23505') {
            return NextResponse.json({ error: 'One or more artists are already in the team.' }, { status: 409 });
          }
          return NextResponse.json({ error: 'Failed to add members to the team.' }, { status: 500 });
        }
        return NextResponse.json({ message: 'Members added successfully', data }, { status: 201 });
      })


    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
