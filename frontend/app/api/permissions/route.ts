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

// GET: Fetch all users with edit permissions for an artist
export async function GET(request: NextRequest) {
  try {
    console.log("getting user info")
    const { searchParams } = new URL(request.url);
    const artistId = searchParams.get("artist_id");

    if (!artistId) {
      return NextResponse.json(
        { error: "artist_id is required" },
        { status: 400 }
      );
    }

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

    // Get all permissions for this artist
    const { data: permissions, error } = await supabase
      .from("edit_permissions")
      .select(
        `
        auth_id,
        artist_id
      `
      )
      .eq("artist_id", artistId);

    if (error) {
      console.error("Error fetching permissions:", error);
      return NextResponse.json(
        { error: "Failed to fetch permissions" },
        { status: 500 }
      );
    }

    // Get user details from user_profiles for each auth_id
    if (permissions && permissions.length > 0) {
      const authIds = permissions.map((p) => p.auth_id);
      const { data: userProfiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("auth_id, email, user_type")
        .in("auth_id", authIds);

      if (profilesError) {
        console.error("Error fetching user profiles:", profilesError);
        return NextResponse.json(
          { error: "Failed to fetch user profiles" },
          { status: 500 }
        );
      }

      // Merge user profile data with permissions
      const permissionsWithUserData = permissions.map((permission) => {
        const userProfile = userProfiles?.find(
          (profile) => profile.auth_id === permission.auth_id
        );
        return {
          ...permission,
          email: userProfile?.email || null,
          user_type: userProfile?.user_type || null,
        };
      });

      return NextResponse.json({ permissions: permissionsWithUserData });
    }

    return NextResponse.json({ permissions: [] });
  } catch (error) {
    console.error("Error in GET permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 }
    );
  }
}

// POST: Add a new edit permission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auth_id, artist_id } = body;

    if (!auth_id || !artist_id) {
      return NextResponse.json(
        { error: "auth_id and artist_id are required" },
        { status: 400 }
      );
    }

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

    // Verify the requesting user is the artist or already has edit permission
    const { data: artistUser, error: artistError } = await supabase
      .from("artist_user")
      .select("auth_id")
      .eq("artist_id", artist_id)
      .single();

    if (artistError || !artistUser) {
      return NextResponse.json(
        { error: "Artist not found" },
        { status: 404 }
      );
    }

    // Check if requesting user is the artist
    if (artistUser.auth_id !== user.id) {
      // If not the artist, check if they have edit permission
      const { data: permission } = await supabase
        .from("edit_permissions")
        .select("auth_id")
        .eq("auth_id", user.id)
        .eq("artist_id", artist_id)
        .single();

      if (!permission) {
        return NextResponse.json(
          { error: "You do not have permission to manage this portfolio" },
          { status: 403 }
        );
      }
    }

    // Check if permission already exists
    const { data: existingPermission } = await supabase
      .from("edit_permissions")
      .select("auth_id")
      .eq("auth_id", auth_id)
      .eq("artist_id", artist_id)
      .single();

    if (existingPermission) {
      return NextResponse.json(
        { error: "Permission already exists" },
        { status: 409 }
      );
    }

    // Add the permission
    const { data, error } = await supabase
      .from("edit_permissions")
      .insert({ auth_id, artist_id })
      .select()
      .single();

    if (error) {
      console.error("Error adding permission:", error);
      return NextResponse.json(
        { error: "Failed to add permission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ permission: data }, { status: 201 });
  } catch (error) {
    console.error("Error in POST permissions:", error);
    return NextResponse.json(
      { error: "Failed to add permission" },
      { status: 500 }
    );
  }
}

// DELETE: Remove an edit permission
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const authId = searchParams.get("auth_id");
    const artistId = searchParams.get("artist_id");

    if (!authId || !artistId) {
      return NextResponse.json(
        { error: "auth_id and artist_id are required" },
        { status: 400 }
      );
    }

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

    // Verify the requesting user is the artist
    const { data: artistUser } = await supabase
      .from("artist_user")
      .select("auth_id")
      .eq("artist_id", artistId)
      .single();

    if (!artistUser || artistUser.auth_id !== user.id) {
      return NextResponse.json(
        { error: "You do not have permission to remove this permission" },
        { status: 403 }
      );
    }

    // Delete the permission
    const { error } = await supabase
      .from("edit_permissions")
      .delete()
      .eq("auth_id", authId)
      .eq("artist_id", artistId);

    if (error) {
      console.error("Error deleting permission:", error);
      return NextResponse.json(
        { error: "Failed to delete permission" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in DELETE permissions:", error);
    return NextResponse.json(
      { error: "Failed to delete permission" },
      { status: 500 }
    );
  }
}
