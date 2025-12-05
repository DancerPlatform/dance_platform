import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || email.trim() === "") {
      return NextResponse.json({ users: [] });
    }

    // Search in user_profiles table for users by email
    const { data: users, error } = await supabase
      .from("user_profiles")
      .select("auth_id, email, user_type")
      .ilike("email", `%${email.trim()}%`)
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json(
        { error: "Failed to search users" },
        { status: 500 }
      );
    }

    return NextResponse.json({ users: users || [] });
  } catch (error) {
    console.error("Error in user search:", error);
    return NextResponse.json(
      { error: "Failed to search users" },
      { status: 500 }
    );
  }
}