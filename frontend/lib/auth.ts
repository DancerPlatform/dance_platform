import { supabase } from './supabase'
import type { UserType, UserProfile, ClientUser, ArtistUser, NormalUser } from './types/auth'

/**
 * Sign up a new user with the specified user type
 * For artists: Only creates auth record, no database records
 * For clients/users: Creates auth + database records
 */
export async function signUp(
  email: string,
  password: string,
  userType: UserType,
  userData: {
    name: string
    phone?: string
    birth?: string
    company_id?: string
  }
) {
  try {
    // Create the auth user with user_type in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType,
          name: userData.name,
        },
      },
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('No user returned from signup')

    // Verify the user was created in auth.users
    if (!authData.user.id) throw new Error('User ID not available')

    // For artists: ONLY create auth record, no database records
    // User will choose to create or claim portfolio later
    if (userType === 'artist') {
      return { user: authData.user, error: null }
    }

    // Generate a unique ID for non-artist users
    const userId = crypto.randomUUID()

    // Create the user-specific record for clients and normal users
    if (userType === 'client') {
      const { error: clientError } = await supabase
        .from('client_user')
        .insert({
          client_id: userId,
          name: userData.name,
          email,
          phone: userData.phone || null,
          company_id: userData.company_id || null,
          auth_id: authData.user.id,
        })

      if (clientError) throw clientError
    } else {
      const { error: userError } = await supabase
        .from('user')
        .insert({
          user_id: userId,
          name: userData.name,
          email,
          phone: userData.phone || null,
          auth_id: authData.user.id,
        })

      if (userError) throw userError
    }

    return { user: authData.user, error: null }
  } catch (error) {
    console.error('Signup error:', error)
    return { user: null, error: error as Error }
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { user: null, error }
  }

  return { user: data.user, error: null }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

/**
 * Get the current user's profile
 */
export async function getUserProfile(authId: string): Promise<UserProfile | null> {
  console.log("Received Auth Id", authId)
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

/**
 * Get client user data
 */
export async function getClientUser(authId: string): Promise<ClientUser | null> {
  const { data, error } = await supabase
    .from('client_user')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error fetching client user:', error)
    return null
  }

  return data
}

/**
 * Get artist user data
 */
export async function getArtistUser(authId: string): Promise<ArtistUser | null> {
  const { data, error } = await supabase
    .from('artist_user')
    .select(`
      *,
      portfolio:artist_portfolio(photo)
    `)
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error fetching artist user:', error)
    return null
  }

  // Extract the photo from the portfolio join
  const portfolioPhoto = (data as any)?.portfolio?.photo || null

  return {
    ...data,
    portfolio_photo: portfolioPhoto
  }
}

/**
 * Get normal user data
 */
export async function getNormalUser(authId: string): Promise<NormalUser | null> {
  const { data, error } = await supabase
    .from('user')
    .select('*')
    .eq('auth_id', authId)
    .single()

  if (error) {
    console.error('Error fetching normal user:', error)
    return null
  }

  return data
}

/**
 * Get the complete user data based on their type
 */
export async function getCompleteUserData(authId: string) {
  const profile = await getUserProfile(authId)
  console.log("Profile")

  if (!profile) {
    return { profile: null, userData: null }
  }

  let userData = null

  switch (profile.user_type) {
    case 'client':
      userData = await getClientUser(authId)
      break
    case 'artist':
      userData = await getArtistUser(authId)
      break
    case 'user':
      userData = await getNormalUser(authId)
      break
  }

  return { profile, userData }
}
