import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { getCompleteUserData } from '@/lib/auth'
import type { AuthState, UserProfile, ClientUser, ArtistUser, NormalUser } from '@/lib/types/auth'
import type { User } from '@supabase/supabase-js'

// Custom event for cross-tab auth sync
const AUTH_SYNC_EVENT = 'auth-sync'

interface AuthStore extends AuthState {
  // Internal state
  sessionId: string | null
  initialized: boolean

  // Actions
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile?: UserProfile | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
  initialize: () => Promise<void>

  // Internal actions
  _loadUserData: (user: User) => Promise<void>
  _clearState: () => void
  _setupListeners: () => () => void
}

const initialState: AuthState & { sessionId: string | null; initialized: boolean } = {
  user: null,
  profile: null,
  clientUser: null,
  artistUser: null,
  normalUser: null,
  loading: true,
  error: null,
  sessionId: null,
  initialized: false,
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  ...initialState,

  _loadUserData: async (user: User) => {
    try {
      const { profile, userData } = await getCompleteUserData(user.id)

      if (!profile) {
        set({
          user: {
            id: user.id,
            email: user.email || '',
            user_metadata: user.user_metadata,
          },
          profile: null,
          clientUser: null,
          artistUser: null,
          normalUser: null,
          loading: false,
          error: null,
        })
        return
      }

      set({
        user: {
          id: user.id,
          email: user.email || '',
          user_metadata: user.user_metadata,
        },
        profile,
        clientUser: profile.user_type === 'client' ? (userData as ClientUser) : null,
        artistUser: profile.user_type === 'artist' ? (userData as ArtistUser) : null,
        normalUser: profile.user_type === 'user' ? (userData as NormalUser) : null,
        loading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error loading user data:', error)
      set({ loading: false, error: error as Error })
    }
  },

  _clearState: () => {
    set({
      user: null,
      profile: null,
      clientUser: null,
      artistUser: null,
      normalUser: null,
      loading: false,
      error: null,
      sessionId: null,
    })
  },

  _setupListeners: () => {
    const { _loadUserData, _clearState } = get()

    // Handle storage events from other tabs
    const handleStorageChange = async (e: StorageEvent) => {
      if (e.key && e.key.includes('auth-token')) {
        console.log('Auth storage changed in another tab')

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          set({ sessionId: session.access_token, loading: true })
          await _loadUserData(session.user)
        } else {
          _clearState()
        }
      }
    }

    // Handle custom auth sync events
    const handleAuthSync = async () => {
      console.log('Auth sync event received from another tab')

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        set({ sessionId: session.access_token, loading: true })
        await _loadUserData(session.user)
      } else {
        _clearState()
      }
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener(AUTH_SYNC_EVENT, handleAuthSync)

    // Return cleanup function
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener(AUTH_SYNC_EVENT, handleAuthSync)
    }
  },

  initialize: async () => {
    const { initialized, _loadUserData } = get()

    // Prevent double initialization
    if (initialized) return

    set({ initialized: true })

    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('Error getting session:', error)
        set({ loading: false, error })
        return
      }

      if (session?.user) {
        set({ sessionId: session.access_token })
        await _loadUserData(session.user)
      } else {
        set({ loading: false })
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
      set({ loading: false, error: error as Error })
    }
  },

  refreshUser: async () => {
    const { _loadUserData } = get()
    set({ loading: true })

    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        await _loadUserData(user)
      } else {
        set({
          user: null,
          profile: null,
          clientUser: null,
          artistUser: null,
          normalUser: null,
          loading: false,
          error: null,
        })
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      set({ loading: false, error: error as Error })
    }
  },

  signIn: async (email: string, password: string) => {
    const { _loadUserData } = get()
    set({ loading: true, error: null })

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      set({ loading: false, error })
      return { error }
    }

    if (data.user && data.session) {
      const { profile } = await getCompleteUserData(data.user.id)
      set({ sessionId: data.session.access_token })
      await _loadUserData(data.user)

      // Notify other tabs about sign in
      window.dispatchEvent(new Event(AUTH_SYNC_EVENT))

      return { error: null, profile }
    }

    return { error: null }
  },

  signOut: async () => {
    const { _clearState } = get()
    set({ loading: true })

    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      set({ loading: false, error })
      return
    }

    _clearState()

    // Notify other tabs about sign out
    window.dispatchEvent(new Event(AUTH_SYNC_EVENT))
  },
}))

// Hook for backwards compatibility - same API as the old useAuth
export function useAuth() {
  const store = useAuthStore()

  return {
    user: store.user,
    profile: store.profile,
    clientUser: store.clientUser,
    artistUser: store.artistUser,
    normalUser: store.normalUser,
    loading: store.loading,
    error: store.error,
    signIn: store.signIn,
    signOut: store.signOut,
    refreshUser: store.refreshUser,
  }
}
