import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key for admin operations (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const field = searchParams.get('field') // 'email' or 'phone'
  const value = searchParams.get('value')

  // console.log(value)

  if (!field || !value) {
    return NextResponse.json(
      { error: 'field and value are required' },
      { status: 400 }
    )
  }

  if (field !== 'email' && field !== 'phone') {
    return NextResponse.json(
      { error: 'field must be either "email" or "phone"' },
      { status: 400 }
    )
  }

  try {
    // Check across all user tables: artist_user, client_user, and user
    // const tables = ['artist_user', 'client_user', 'user']

    console.log('this is the value in try', value)
    const {data, error} = await supabaseAdmin
    .from('user_profiles')
    .select('email')
    .eq('email', value)
    .single()

    console.log(data)

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is the "no rows returned" error code
      console.error(`Error checking ${field} in 'user_profiles:`, error)
      return NextResponse.json(
        { error: `Failed to check ${field} availability` },
        { status: 500 }
      )
    }

    if (data) {
      return NextResponse.json({
        available: false,
        field,
        value,
        message: `This ${field} is already registered`,
      })
    }


    // for (const table of tables) {
    //   console.log(field, value)
    //   const { data, error } = await supabase
    //     .from(table)
    //     .select(field)
    //     .eq(field, value)
    //     .single()

    //   if (error && error.code !== 'PGRST116') {
    //     // PGRST116 is the "no rows returned" error code
    //     console.error(`Error checking ${field} in ${table}:`, error)
    //     return NextResponse.json(
    //       { error: `Failed to check ${field} availability` },
    //       { status: 500 }
    //     )
    //   }

    //   // If data exists in any table, the field value is taken
    //   if (data) {
    //     return NextResponse.json({
    //       available: false,
    //       field,
    //       value,
    //       message: `This ${field} is already registered`,
    //     })
    //   }
    // }

    // If we got here, the value is available in all tables
    return NextResponse.json({
      available: true,
      field,
      value,
      message: `This ${field} is available`,
    })
  } catch (error) {
    console.error(`Error checking ${field}:`, error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
