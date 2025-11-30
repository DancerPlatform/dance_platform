'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import type { UserType } from '@/lib/types/auth'

/**
 * Hook to protect routes that require authentication
 * Redirects to login page if user is not authenticated
 * Optionally checks if user has the required user type
 */
export function useRequireAuth(requiredType?: UserType) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Not authenticated, redirect to login
        router.push('/login')
      } else if (requiredType && profile?.user_type !== requiredType) {
        // Authenticated but wrong user type
        router.push('/login')
      }
    }
  }, [user, profile, loading, requiredType, router])

  return { user, profile, loading }
}
