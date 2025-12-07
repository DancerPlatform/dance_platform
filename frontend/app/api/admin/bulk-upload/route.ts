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
  profile: number;
  choreography: number;
  media: number;
  performance: number;
  directing: number;
  workshop: number;
  award: number;
}

function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) {
    throw new Error('CSV file must contain headers and at least one data row');
  }

  // Parse headers - handle quoted values
  const headerLine = lines[0];
  const headers = parseCSVLine(headerLine);
  const rows: CSVRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue; // Skip empty lines

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
  // Remove quotes if present
  const cleaned = value.replace(/^"(.*)"$/, '$1');
  return cleaned.split(',').map(v => v.trim()).filter(Boolean);
}

async function ensureUserProfile(authId: string, email: string, userType: 'artist' | 'client' | 'user' = 'artist') {
  // Check if user_profile already exists
  const { data: existingProfile } = await supabaseAdmin
    .from('user_profiles')
    .select('auth_id')
    .eq('auth_id', authId)
    .single();

  if (existingProfile) {
    return; // Profile already exists
  }

  // Create new user_profile
  const { error } = await supabaseAdmin
    .from('user_profiles')
    .insert({
      auth_id: authId,
      user_type: userType,
      email: email,
      is_admin: false,
      has_portfolio: true,
    });

  if (error) throw error;
}

async function ensureEditPermission(authId: string, artistId: string) {
  // Check if edit permission already exists
  const { data: existingPermission } = await supabaseAdmin
    .from('edit_permissions')
    .select('permission_id')
    .eq('auth_id', authId)
    .eq('artist_id', artistId)
    .single();

  if (existingPermission) {
    return; // Permission already exists
  }

  // Create new edit permission
  const { error } = await supabaseAdmin
    .from('edit_permissions')
    .insert({
      auth_id: authId,
      artist_id: artistId,
    });

  if (error) throw error;
}

async function processRow(row: CSVRow, counts: ProcessedCounts, errors: string[]) {
  const section = row.section?.toLowerCase();

  try {
    switch (section) {
      case 'profile':
        await processProfile(row);
        counts.profile++;
        break;

      case 'choreography':
        await processChoreography(row);
        counts.choreography++;
        break;

      case 'media':
        await processMedia(row);
        counts.media++;
        break;

      case 'performance':
        await processPerformance(row);
        counts.performance++;
        break;

      case 'directing':
        await processDirecting(row);
        counts.directing++;
        break;

      case 'workshop':
        await processWorkshop(row);
        counts.workshop++;
        break;

      case 'award':
        await processAward(row);
        counts.award++;
        break;

      default:
        throw new Error(`Unknown section type: ${section}`);
    }
  } catch (err) {
    errors.push(`[${section}] artist_id ${row.artist_id}: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }
}

async function processProfile(row: CSVRow) {
  // Upsert artist_portfolio
  const { error } = await supabaseAdmin
    .from('artist_portfolio')
    .upsert({
      artist_id: row.artist_id,
      artist_name: row.artist_name || null,
      artist_name_eng: row.artist_name_eng || null,
      introduction: row.introduction || null,
      photo: row.photo || null,
      instagram: row.instagram || null,
      twitter: row.twitter || null,
      youtube: row.youtube || null,
    }, { onConflict: 'artist_id' });

  if (error) throw error;

  // If auth_id and email are provided, create/update user_profile and edit_permissions
  if (row.auth_id && row.email) {
    await ensureUserProfile(row.auth_id, row.email, 'artist');
    await ensureEditPermission(row.auth_id, row.artist_id);
  }
}

async function processChoreography(row: CSVRow) {
  const songId = randomUUID()
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

  // Then, upsert the dancer_choreo relationship
  const { error: choreoError } = await supabaseAdmin
    .from('dancer_choreo')
    .upsert({
      artist_id: row.artist_id,
      song_id: songId,
      role: parseArray(row.role),
      is_highlight: parseBoolean(row.is_highlight),
      display_order: row.display_order ? parseInt(row.display_order) : null,
    }, { onConflict: 'song_id,artist_id' });

  if (choreoError) throw choreoError;
}

async function processMedia(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('dancer_media')
    .insert({
      artist_id: row.artist_id,
      youtube_link: row.youtube_link,
      role: row.role || 'Dancer',
      title: row.media_title || null,
      video_date: row.video_date || null,
      is_highlight: parseBoolean(row.is_highlight),
      display_order: parseInt(row.display_order) || 0,
    });

  if (error) throw error;
}

async function processPerformance(row: CSVRow) {
  // Generate a new UUID for the performance
  const performanceId = randomUUID();

  // Insert the performance with generated UUID
  const { error: perfError } = await supabaseAdmin
    .from('performance')
    .insert({
      performance_id: performanceId,
      performance_title: row.performance_title,
      date: row.performance_date,
      category: row.category || null,
    });

  if (perfError) throw perfError;

  // Then, insert the dancer_performance relationship
  const { error: dancerPerfError } = await supabaseAdmin
    .from('dancer_performance')
    .insert({
      artist_id: row.artist_id,
      performance_id: performanceId,
    });

  if (dancerPerfError) throw dancerPerfError;
}

async function processDirecting(row: CSVRow) {
  // Generate a new UUID for the directing
  const directingId = randomUUID();

  // Insert the directing with generated UUID
  const { error: dirError } = await supabaseAdmin
    .from('directing')
    .insert({
      directing_id: directingId,
      title: row.directing_title,
      date: row.directing_date,
    });

  if (dirError) throw dirError;

  // Then, insert the dancer_directing relationship
  const { error: dancerDirError } = await supabaseAdmin
    .from('dancer_directing')
    .insert({
      artist_id: row.artist_id,
      directing_id: directingId,
    });

  if (dancerDirError) throw dancerDirError;
}

async function processWorkshop(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('workshop')
    .upsert({
      artist_id: row.artist_id,
      class_name: row.class_name,
      class_role: parseArray(row.class_role),
      class_date: row.class_date,
      country: row.country,
    }, { onConflict: 'artist_id,class_name' });

  if (error) throw error;
}

async function processAward(row: CSVRow) {
  const { error } = await supabaseAdmin
    .from('dancer_award')
    .upsert({
      artist_id: row.artist_id,
      issuing_org: row.issuing_org,
      award_title: row.award_title,
      received_date: row.received_date,
    }, { onConflict: 'artist_id,issuing_org' });

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
      profile: 0,
      choreography: 0,
      media: 0,
      performance: 0,
      directing: 0,
      workshop: 0,
      award: 0,
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
        errors: errors.slice(0, 20), // Limit to first 20 errors
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${totalProcessed} rows`,
      processed: counts,
    });

  } catch (error) {
    console.error('Bulk upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process upload' },
      { status: 500 }
    );
  }
}
