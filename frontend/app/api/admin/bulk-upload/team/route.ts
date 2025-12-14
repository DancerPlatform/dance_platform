import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

interface CSVRow {
  [key: string]: string;
}

interface ProcessedCounts {
  team_profile: number;
  team_choreography: number;
  team_media: number;
  team_performance: number;
  team_directing: number;
  team_workshop: number;
  team_award: number;
  team_members: number;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;

    const values = parseCSVLine(lines[i]);
    const row: CSVRow = {};

    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });

    rows.push(row);
  }

  return rows;
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  result.push(current.trim());
  return result;
}

function parseBoolean(value: string): boolean {
  return value.toLowerCase() === 'true';
}

function parseArray(value: string): string[] {
  if (!value) return [];
  const cleaned = value.replace(/^"(.*)"$/, '$1');
  return cleaned.split(',').map(v => v.trim()).filter(Boolean);
}

async function processRow(row: CSVRow, counts: ProcessedCounts, errors: string[]) {
  const section = row.section?.toLowerCase();

  try {
    switch (section) {
      case 'team_profile':
        await processTeamProfile(row);
        counts.team_profile++;
        break;

      case 'team_choreography':
        await processTeamChoreography(row);
        counts.team_choreography++;
        break;

      case 'team_media':
        await processTeamMedia(row);
        counts.team_media++;
        break;

      case 'team_performance':
        await processTeamPerformance(row);
        counts.team_performance++;
        break;

      case 'team_directing':
        await processTeamDirecting(row);
        counts.team_directing++;
        break;

      case 'team_workshop':
        await processTeamWorkshop(row);
        counts.team_workshop++;
        break;

      case 'team_award':
        await processTeamAward(row);
        counts.team_award++;
        break;

      case 'team_members':
        await processTeamMembers(row);
        counts.team_members++;
        break;

      default:
        throw new Error(`Unknown section type: ${section}`);
    }
  } catch (err) {
    console.error(`Error processing ${section} for team_id ${row.team_id}:`, err);
    const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
    errors.push(`[${section}] team_id ${row.team_id}: ${errorMessage}`);
  }
}

async function processTeamProfile(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('team_portfolio')
    .upsert({
      team_id: row.team_id,
      team_name: row.team_name,
      team_introduction: row.team_introduction || null,
      leader_id: row.leader_id,
      subleader_id: row.subleader_id || null,
      photo: row.photo || null,
      instagram: row.instagram || null,
      twitter: row.twitter || null,
      youtube: row.youtube || null,
    }, { onConflict: 'team_id' });

  if (error) throw error;
}

async function processTeamChoreography(row: CSVRow) {
  const songId = randomUUID();

  // First, upsert the song
  const { error: songError } = await supabaseAdmin
    .from('song')
    .upsert({
      song_id: songId,
      title: row.song_title,
      singer: row.singer,
      youtube_link: row.youtube_link,
      date: row.song_date,
    }, { onConflict: 'song_id' });

  if (songError) throw songError;

  // Then, upsert the team_choreo relationship
  const { error: choreoError } = await supabaseAdmin
    .from('team_choreo')
    .upsert({
      team_id: row.team_id,
      song_id: songId,
      role: parseArray(row.role),
      is_highlight: parseBoolean(row.is_highlight),
      display_order: row.display_order ? parseInt(row.display_order) : null,
    }, { onConflict: 'song_id,team_id' });

  if (choreoError) throw choreoError;
}

async function processTeamMedia(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('team_media')
    .insert({
      team_id: row.team_id,
      youtube_link: row.youtube_link,
      role: row.role || 'Performance',
      title: row.media_title || null,
      video_date: row.video_date || null,
      is_highlight: parseBoolean(row.is_highlight),
      display_order: parseInt(row.display_order) || 0,
    });

  if (error) throw error;
}

async function processTeamPerformance(row: CSVRow) {
  const performanceId = randomUUID();

  // Insert the performance
  const { error: perfError } = await supabaseAdmin
    .from('performance')
    .insert({
      performance_id: performanceId,
      performance_title: row.performance_title,
      date: row.performance_date,
      category: row.category || null,
    });

  if (perfError) throw perfError;

  // Then, insert the team_performance relationship
  const { error: teamPerfError } = await supabaseAdmin
    .from('team_performance')
    .insert({
      team_id: row.team_id,
      performance_id: performanceId,
    });

  if (teamPerfError) throw teamPerfError;
}

async function processTeamDirecting(row: CSVRow) {
  const directingId = randomUUID();

  // Insert the directing
  const { error: dirError } = await supabaseAdmin
    .from('directing')
    .insert({
      directing_id: directingId,
      title: row.directing_title,
      date: row.directing_date,
    });

  if (dirError) throw dirError;

  // Then, insert the team_directing relationship
  const { error: teamDirError } = await supabaseAdmin
    .from('team_directing')
    .insert({
      team_id: row.team_id,
      directing_id: directingId,
    });

  if (teamDirError) throw teamDirError;
}

async function processTeamWorkshop(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('team_workshop')
    .upsert({
      team_id: row.team_id,
      class_name: row.class_name,
      class_role: parseArray(row.class_role),
      class_date: row.class_date,
      country: row.country,
    }, { onConflict: 'team_id,class_name' });

  if (error) throw error;
}

async function processTeamAward(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('team_award')
    .upsert({
      team_id: row.team_id,
      issuing_org: row.issuing_org,
      award_title: row.award_title,
      received_date: row.received_date,
    }, { onConflict: 'team_id,issuing_org' });

  if (error) throw error;
}

async function processTeamMembers(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('artist_team')
    .upsert({
      team_id: row.team_id,
      artist_id: row.artist_id,
    }, { onConflict: 'artist_id,team_id' });

  if (error) throw error;
}

export async function POST(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAdmin
      .from('user_profiles')
      .select('is_admin')
      .eq('auth_id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Read CSV file
    const csvText = await file.text();
    const rows = parseCSV(csvText);

    if (rows.length === 0) {
      return NextResponse.json({ error: 'CSV file contains no data rows' }, { status: 400 });
    }

    // Process all rows
    const counts: ProcessedCounts = {
      team_profile: 0,
      team_choreography: 0,
      team_media: 0,
      team_performance: 0,
      team_directing: 0,
      team_workshop: 0,
      team_award: 0,
      team_members: 0,
    };
    const errors: string[] = [];

    for (const row of rows) {
      await processRow(row, counts, errors);
    }

    const totalProcessed = Object.values(counts).reduce((a, b) => a + b, 0);

    if (errors.length > 0) {
      return NextResponse.json({
        success: false,
        message: `Processed ${totalProcessed} of ${rows.length} rows. ${errors.length} errors occurred.`,
        processed: counts,
        errors: errors.slice(0, 20),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${totalProcessed} rows`,
      processed: counts,
    });

  } catch (error) {
    console.error('Team bulk upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
}
