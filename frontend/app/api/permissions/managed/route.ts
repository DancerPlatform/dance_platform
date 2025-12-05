import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://afcfdunxkikbergebhro.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmY2ZkdW54a2lrYmVyZ2ViaHJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5MzY3NjksImV4cCI6MjA3OTUxMjc2OX0.Nm7_Gq2L8PPpBK7ttwrFSZVFCIOC85HHkPzU-txKSLI';

// Helper function to create authenticated Supabase client from request
function getSupabaseClient(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
}

// GET: Fetch all portfolios where the current user has edit permissions (excluding their own)
export async function GET(request: NextRequest) {
  try {
    // Get authenticated Supabase client
    const supabase = getSupabaseClient(request);
    if (!supabase) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the current user's artist_id (if they are an artist)
    const { data: currentArtist } = await supabase
      .from("artist_user")
      .select("artist_id")
      .eq("auth_id", user.id)
      .single();

    const currentArtistId = currentArtist?.artist_id;

    // Get all permissions for this user
    const { data: permissions, error: permissionsError } = await supabase
      .from("edit_permissions")
      .select("artist_id")
      .eq("auth_id", user.id);

    if (permissionsError) {
      console.error("Error fetching permissions:", permissionsError);
      return NextResponse.json(
        { error: "Failed to fetch permissions" },
        { status: 500 }
      );
    }

    if (!permissions || permissions.length === 0) {
      return NextResponse.json({ portfolios: [] });
    }

    // Filter out the user's own portfolio
    const artistIds = permissions
      .map((p) => p.artist_id)
      .filter((id) => id !== currentArtistId);

    if (artistIds.length === 0) {
      return NextResponse.json({ portfolios: [] });
    }

    // Get artist details for each artist_id
    const { data: artists, error: artistsError } = await supabase
      .from("artist_user")
      .select("artist_id, name")
      .in("artist_id", artistIds);

    if (artistsError) {
      console.error("Error fetching artists:", artistsError);
      return NextResponse.json(
        { error: "Failed to fetch artists" },
        { status: 500 }
      );
    }

    return NextResponse.json({ portfolios: artists || [] });
  } catch (error) {
    console.error("Error in GET managed portfolios:", error);
    return NextResponse.json(
      { error: "Failed to fetch managed portfolios" },
      { status: 500 }
    );
  }
}
