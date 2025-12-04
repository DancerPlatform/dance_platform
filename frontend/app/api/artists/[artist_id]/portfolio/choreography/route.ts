import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function PUT(   ///async, await = db에서 데이터 가져올 시간 기다리기 timesleep
  request: NextRequest,
  { params }: { params: Promise<{ artist_id: string }> }   ///URL에서 가져온 변수 
) {
  try {
    console.log("PATH =", request.nextUrl.pathname);  //url 경로 출력
    console.log("PARAMS =", params);  // 파라미터값 출력  ex. artist_id

    const { artist_id } = await params;
    console.log('PUT /choreo artist_id =', artist_id); //artist_id 로그

    const body = await request.json(); //body 파싱
    const { choreography } = body;   // body 내부 choregraphy 필드 꺼내기 

    // Get auth token from request headers
    const authHeader = request.headers.get('authorization');
    console.log('AUTH HEADER =', authHeader); //author 로그

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

    // Update choreography items
    if (choreography && Array.isArray(choreography)) {
      const { data: existingChoreo, error: existingError } = await authClient
        .from('dancer_choreo')
        .select('song_id, role, is_highlight, display_order')
        .eq('artist_id', artist_id);
      
      console.log('EXISTING CHOREO =', existingChoreo,'ERROR =', existingError);   

      const existingSongIds = new Set(
        existingChoreo?.map((item) => item.song_id) || []
      );

      // Track processed songs
      const processedSongs = new Set<string>();

      for (let i = 0; i < choreography.length; i++) {
        const item = choreography[i];
        if (item.song?.song_id && existingSongIds.has(item.song.song_id)) {
          // Update existing item with correct order
          processedSongs.add(item.song.song_id);
          await authClient
            .from('dancer_choreo')
            .update({
              role: item.role || [],
              is_highlight: item.is_highlight || false,
              display_order: i,
            })
            .eq('artist_id', artist_id)
            .eq('song_id', item.song.song_id);
        } else if (item.song && !item.song.song_id) {
          // New choreography - insert song first, then relationship
          const songId = `song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          await authClient.from('song').insert({
            song_id: songId,
            title: item.song.title,
            singer: item.song.singer,
            date: item.song.date,
            youtube_link: item.song.youtube_link || null,
          });

          await authClient.from('dancer_choreo').insert({
            artist_id,
            song_id: songId,
            role: item.role || [],
            is_highlight: item.is_highlight || false,
            display_order: i,
          });
          processedSongs.add(songId);
        }
      }

      // Delete choreography relationships not in the new list
      for (const existing of existingChoreo || []) {
        if (!processedSongs.has(existing.song_id)) {
          await authClient
            .from('dancer_choreo')
            .delete()
            .eq('artist_id', artist_id)
            .eq('song_id', existing.song_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating choreography:', error);
    return NextResponse.json(
      { error: 'Failed to update choreography' },
      { status: 500 }
    );
  }
}