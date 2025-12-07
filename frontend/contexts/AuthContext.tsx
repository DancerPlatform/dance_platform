'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { getCompleteUserData } from '@/lib/auth'
import type { AuthState, UserProfile, ClientUser, ArtistUser, NormalUser } from '@/lib/types/auth'
import type { User } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<{ error: Error | null; profile?: UserProfile | null }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Custom event for cross-tab auth sync
const AUTH_SYNC_EVENT = 'auth-sync'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    clientUser: null,
    artistUser: null,
    normalUser: null,
    loading: true,
    error: null,
  })

  // Track session ID to detect changes across tabs
  const [sessionId, setSessionId] = useState<string | null>(null)

  const loadUserData = async (user: User) => {
    try {
      const { profile, userData } = await getCompleteUserData(user.id)

      if (!profile) {
        setState(prev => ({
          ...prev,
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
        }))
        return
      }

      // Set the user data based on type
      const newState: AuthState = {
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
      }

      setState(newState)
    } catch (error) {
      console.error('Error loading user data:', error)
      setState(prev => ({
        ...prev,
        loading: false,
        error: error as Error,
      }))
    }
  }

  const refreshUser = async () => {
    setState(prev => ({ ...prev, loading: true }))
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await loadUserData(user)
      } else {
        setState({
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
      setState(prev => ({ ...prev, loading: false, error: error as Error }))
    }
  }

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error getting session:', error)
          setState(prev => ({ ...prev, loading: false, error }))
          return
        }

        if (session?.user) {
          setSessionId(session.access_token)
          await loadUserData(session.user)
        } else {
          setSessionId(null)
          setState(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setState(prev => ({ ...prev, loading: false, error: error as Error }))
      }
    }

    initializeAuth()
  }, [])

  // Listen for storage events from other tabs
  useEffect(() => {
    const handleStorageChange = async (e: StorageEvent) => {
      // Supabase stores auth token in localStorage with key pattern 'sb-*-auth-token'
      if (e.key && e.key.includes('auth-token')) {
        console.log('Auth storage changed in another tab')

        const { data: { session } } = await supabase.auth.getSession()

        if (session?.user) {
          setSessionId(session.access_token)
          setState(prev => ({ ...prev, loading: true }))
          await loadUserData(session.user)
        } else {
          setSessionId(null)
          setState({
            user: null,
            profile: null,
            clientUser: null,
            artistUser: null,
            normalUser: null,
            loading: false,
            error: null,
          })
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  // Listen for custom auth sync events
  useEffect(() => {
    const handleAuthSync = async () => {
      console.log('Auth sync event received from another tab')

      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        setSessionId(session.access_token)
        setState(prev => ({ ...prev, loading: true }))
        await loadUserData(session.user)
      } else {
        setSessionId(null)
        setState({
          user: null,
          profile: null,
          clientUser: null,
          artistUser: null,
          normalUser: null,
          loading: false,
          error: null,
        })
      }
    }

    window.addEventListener(AUTH_SYNC_EVENT, handleAuthSync)

    return () => {
      window.removeEventListener(AUTH_SYNC_EVENT, handleAuthSync)
    }
  }, [])

  // React to sessionId changes
  useEffect(() => {
    if (sessionId) {
      console.log('Session active:', sessionId.substring(0, 20) + '...')
    } else {
      console.log('No active session')
    }
  }, [sessionId])

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setState(prev => ({ ...prev, loading: false, error }))
      return { error }
    }

    if (data.user && data.session) {
      const { profile } = await getCompleteUserData(data.user.id)
      setSessionId(data.session.access_token)
      await loadUserData(data.user)

      // Notify other tabs about sign in
      window.dispatchEvent(new Event(AUTH_SYNC_EVENT))

      return { error: null, profile }
    }

    return { error: null }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Sign out error:', error)
      setState(prev => ({ ...prev, loading: false, error }))
      return
    }

    setSessionId(null)
    setState({
      user: null,
      profile: null,
      clientUser: null,
      artistUser: null,
      normalUser: null,
      loading: false,
      error: null,
    })

    // Notify other tabs about sign out
    window.dispatchEvent(new Event(AUTH_SYNC_EVENT))
  }

  return (
    <AuthContext.Provider value={{ ...state, signIn, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
