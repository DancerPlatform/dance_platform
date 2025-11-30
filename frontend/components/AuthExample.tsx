'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'

/**
 * Example component showing how to use the auth system
 * This can be used as a reference for implementing auth in other components
 */
export function AuthExample() {
  const {
    user,
    profile,
    clientUser,
    artistUser,
    normalUser,
    loading,
    signOut
  } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !profile) {
    return <div>Not authenticated</div>
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h2 className="text-xl font-bold">User Information</h2>
        <p>Email: {user.email}</p>
        <p>User Type: {profile.user_type}</p>
      </div>

      {profile.user_type === 'client' && clientUser && (
        <div>
          <h3 className="text-lg font-semibold">Client Details</h3>
          <p>Name: {clientUser.name}</p>
          <p>Phone: {clientUser.phone}</p>
          <p>Company ID: {clientUser.company_id}</p>
        </div>
      )}

      {profile.user_type === 'artist' && artistUser && (
        <div>
          <h3 className="text-lg font-semibold">Artist Details</h3>
          <p>Name: {artistUser.name}</p>
          <p>Phone: {artistUser.phone}</p>
          <p>Birth: {artistUser.birth}</p>
        </div>
      )}

      {profile.user_type === 'user' && normalUser && (
        <div>
          <h3 className="text-lg font-semibold">User Details</h3>
          <p>Name: {normalUser.name}</p>
          <p>Phone: {normalUser.phone}</p>
        </div>
      )}

      <Button onClick={() => signOut()}>Sign Out</Button>
    </div>
  )
}
