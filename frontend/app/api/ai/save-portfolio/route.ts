import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const authHeader = request.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "No authorization header" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { type, data: portfolioData, artist_id } = body;

    if (!type || !portfolioData || !artist_id) {
      return NextResponse.json(
        { error: "Missing required fields: type, data, and artist_id" },
        { status: 400 }
      );
    }

    if (type === "artist") {
      // Create artist portfolio
      const profile = portfolioData.profile;

      // 1. Create artist_user record
      const { error: artistUserError } = await supabase
        .from("artist_user")
        .insert({
          artist_id: artist_id,
          name: profile.artist_name || "",
          email: user.email || "",
          auth_id: user.id,
        });

      if (artistUserError) {
        console.error("Error creating artist_user:", artistUserError);
        return NextResponse.json(
          { error: "Failed to create artist user", details: artistUserError.message },
          { status: 500 }
        );
      }

      // 2. Create artist_portfolio record
      const { error: portfolioError } = await supabase
        .from("artist_portfolio")
        .insert({
          artist_id: artist_id,
          artist_name: profile.artist_name || "",
          artist_name_eng: profile.artist_name_eng || null,
          introduction: profile.introduction || null,
          photo: profile.photo || null,
          instagram: profile.instagram || null,
          twitter: profile.twitter || null,
          youtube: profile.youtube || null,
          is_hidden: false,
        });

      if (portfolioError) {
        console.error("Error creating artist_portfolio:", portfolioError);
        return NextResponse.json(
          { error: "Failed to create artist portfolio", details: portfolioError.message },
          { status: 500 }
        );
      }

      // 3. Create choreography records
      if (portfolioData.choreography && portfolioData.choreography.length > 0) {
        for (const choreo of portfolioData.choreography) {
          if (!choreo.song_title || !choreo.singer) continue;

          const song_id = `${artist_id}_song_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create song first
          const { error: songError } = await supabase
            .from("song")
            .insert({
              song_id,
              title: choreo.song_title,
              singer: choreo.singer,
              date: choreo.song_date || null,
              youtube_link: choreo.youtube_link || "",
            });

          if (songError && !songError.message.includes("duplicate")) {
            console.error("Error creating song:", songError);
            continue;
          }

          // Create dancer_choreo
          const { error: choreoError } = await supabase
            .from("dancer_choreo")
            .insert({
              song_id,
              artist_id,
              role: choreo.role ? choreo.role.split(",").map((r: string) => r.trim()) : [],
              display_order: choreo.display_order || null,
              is_highlight: choreo.is_highlight || false,
            });

          if (choreoError) {
            console.error("Error creating choreography:", choreoError);
          }
        }
      }

      // 4. Create media records
      if (portfolioData.media && portfolioData.media.length > 0) {
        for (const media of portfolioData.media) {
          if (!media.youtube_link) continue;

          const { error: mediaError } = await supabase
            .from("dancer_media")
            .insert({
              artist_id,
              youtube_link: media.youtube_link,
              role: media.media_title || "",
              title: media.media_title || null,
              video_date: media.video_date || null,
              display_order: media.display_order || 0,
              is_highlight: media.is_highlight || false,
            });

          if (mediaError) {
            console.error("Error creating media:", mediaError);
          }
        }
      }

      // 5. Create performance records
      if (portfolioData.performance && portfolioData.performance.length > 0) {
        for (const perf of portfolioData.performance) {
          if (!perf.performance_title) continue;

          const performance_id = `${artist_id}_perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create performance
          const { error: perfError } = await supabase
            .from("performance")
            .insert({
              performance_id,
              performance_title: perf.performance_title,
              date: perf.performance_date || null,
              category: perf.category || "참가",
            });

          if (perfError && !perfError.message.includes("duplicate")) {
            console.error("Error creating performance:", perfError);
            continue;
          }

          // Create dancer_performance
          const { error: dancerPerfError } = await supabase
            .from("dancer_performance")
            .insert({
              performance_id,
              artist_id,
            });

          if (dancerPerfError) {
            console.error("Error creating dancer_performance:", dancerPerfError);
          }
        }
      }

      // 6. Create directing records
      if (portfolioData.directing && portfolioData.directing.length > 0) {
        for (const dir of portfolioData.directing) {
          if (!dir.directing_title) continue;

          const directing_id = `${artist_id}_dir_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

          // Create directing
          const { error: dirError } = await supabase
            .from("directing")
            .insert({
              directing_id,
              title: dir.directing_title,
              date: dir.directing_date || null,
            });

          if (dirError && !dirError.message.includes("duplicate")) {
            console.error("Error creating directing:", dirError);
            continue;
          }

          // Create dancer_directing
          const { error: dancerDirError } = await supabase
            .from("dancer_directing")
            .insert({
              directing_id,
              artist_id,
            });

          if (dancerDirError) {
            console.error("Error creating dancer_directing:", dancerDirError);
          }
        }
      }

      // 7. Create workshop records
      if (portfolioData.workshop && portfolioData.workshop.length > 0) {
        for (const workshop of portfolioData.workshop) {
          if (!workshop.class_name) continue;

          const { error: workshopError } = await supabase
            .from("workshop")
            .insert({
              artist_id,
              class_name: workshop.class_name,
              class_role: workshop.class_role ? workshop.class_role.split(",").map((r: string) => r.trim()) : [],
              class_date: workshop.class_date || null,
              country: workshop.country || "",
            });

          if (workshopError && !workshopError.message.includes("duplicate")) {
            console.error("Error creating workshop:", workshopError);
          }
        }
      }

      // 8. Create awards records
      if (portfolioData.awards && portfolioData.awards.length > 0) {
        for (const award of portfolioData.awards) {
          if (!award.issuing_org || !award.award_title) continue;

          const { error: awardError } = await supabase
            .from("dancer_award")
            .insert({
              artist_id,
              issuing_org: award.issuing_org,
              award_title: award.award_title,
              received_date: award.received_date || null,
            });

          if (awardError && !awardError.message.includes("duplicate")) {
            console.error("Error creating award:", awardError);
          }
        }
      }

      // 9. Update user_profiles to set has_portfolio = true
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({ has_portfolio: true })
        .eq("auth_id", user.id);

      if (profileError) {
        console.error("Error updating user_profiles:", profileError);
      }

      // 10. Create edit_permissions for the user
      const { error: permError } = await supabase
        .from("edit_permissions")
        .insert({
          auth_id: user.id,
          artist_id: artist_id,
        });

      if (permError) {
        console.error("Error creating edit permissions:", permError);
      }

      return NextResponse.json({
        success: true,
        artist_id,
        message: "Artist portfolio created successfully",
      }, { status: 201 });

    } else if (type === "team") {
      // Team portfolio creation
      const teamProfile = portfolioData.team_profile;

      // 1. Create team_portfolio record
      const { error: teamError } = await supabase
        .from("team_portfolio")
        .insert({
          team_id: artist_id, // Using artist_id as team_id
          team_name: teamProfile.team_name || "",
          team_introduction: teamProfile.team_introduction || null,
          leader_id: teamProfile.leader_id || null,
          subleader_id: teamProfile.subleader_id || null,
          photo: teamProfile.photo || null,
          instagram: teamProfile.instagram || null,
          twitter: teamProfile.twitter || null,
          youtube: teamProfile.youtube || null,
        });

      if (teamError) {
        console.error("Error creating team_portfolio:", teamError);
        return NextResponse.json(
          { error: "Failed to create team portfolio", details: teamError.message },
          { status: 500 }
        );
      }

      // 2. Add team members
      if (portfolioData.team_members && portfolioData.team_members.length > 0) {
        for (const member of portfolioData.team_members) {
          if (!member.artist_id) continue;

          const { error: memberError } = await supabase
            .from("artist_team")
            .insert({
              artist_id: member.artist_id,
              team_id: artist_id,
            });

          if (memberError && !memberError.message.includes("duplicate")) {
            console.error("Error adding team member:", memberError);
          }
        }
      }

      // Similar inserts for team_choreo, team_media, team_performance, etc.
      // (Following same pattern as artist, but using team tables)

      return NextResponse.json({
        success: true,
        team_id: artist_id,
        message: "Team portfolio created successfully",
      }, { status: 201 });
    }

    return NextResponse.json(
      { error: "Invalid portfolio type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error saving portfolio:", error);
    return NextResponse.json(
      {
        error: "Failed to save portfolio",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}