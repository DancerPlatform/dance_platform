// Auth types for the dance platform

export type UserType = 'client' | 'artist' | 'user'

export interface UserProfile {
  auth_id: string
  user_type: UserType
  name?: string
  is_admin?: boolean
  created_at: string
  updated_at: string
}

export interface ClientUser {
  client_id: string
  name: string
  email: string
  phone: string | null
  company_id: string | null
  auth_id: string | null
}

export interface ArtistUser {
  artist_id: string
  name: string
  email: string
  phone: string | null
  birth: string | null
  auth_id: string | null
  portfolio_photo?: string | null
}

export interface NormalUser {
  user_id: string
  name: string
  email: string
  phone: string | null
  auth_id: string | null
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    user_type?: UserType
    [key: string]: any
  }
}

export interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  clientUser: ClientUser | null
  artistUser: ArtistUser | null
  normalUser: NormalUser | null
  loading: boolean
  error: Error | null
}
