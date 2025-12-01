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
          loading: false,
          error: new Error('User profile not found'),
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
  }

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserData(session.user)
      } else {
        setState(prev => ({ ...prev, loading: false }))
      }
    })

    // Listen for changes on auth state
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await loadUserData(session.user)
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
    })

    return () => subscription.unsubscribe()
  }, [])

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

    if (data.user) {
      const { profile } = await getCompleteUserData(data.user.id)
      await loadUserData(data.user)
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
    // The onAuthStateChange listener will handle clearing the state
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
