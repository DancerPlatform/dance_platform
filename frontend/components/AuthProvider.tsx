'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const initialize = useAuthStore((state) => state.initialize)
  const setupListeners = useAuthStore((state) => state._setupListeners)

  useEffect(() => {
    // Initialize auth state
    initialize()

    // Setup cross-tab sync listeners
    const cleanup = setupListeners()

    return cleanup
  }, [initialize, setupListeners])

  return <>{children}</>
}
