'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Upload, FileCheck, TrendingUp, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    pendingClaims: 0,
    totalArtists: 0,
  })
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      // Check if user is admin
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('auth_id', session.user.id)
        .single()

      if (!profile?.is_admin) {
        setError('Access denied. Admin privileges required.')
        setIsAdmin(false)
      } else {
        setIsAdmin(true)
        await fetchStats(session.access_token)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchStats = async (token: string) => {
    try {
      // Fetch pending claims count
      const claimsResponse = await fetch('/api/claims', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (claimsResponse.ok) {
        const claimsData = await claimsResponse.json()
        const pendingCount = claimsData.claims?.filter((c: any) => c.status === 'pending').length || 0

        // Fetch total artists count
        const { count: artistCount } = await supabase
          .from('artist_portfolio')
          .select('*', { count: 'exact', head: true })

        setStats({
          pendingClaims: pendingCount,
          totalArtists: artistCount || 0,
        })
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Alert className="bg-red-500/10 border-red-500/50 max-w-md">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400">
            {error || 'Access denied. Admin privileges required.'}
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-gray-400">Manage your dance platform</p>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/50 mb-6">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Pending Claims Card */}
            <Card className="bg-zinc-900 border-zinc-800 hover:border-green-600/50 transition-colors cursor-pointer" onClick={() => router.push('/admin/claims')}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Pending Claims</CardTitle>
                <FileCheck className="h-4 w-4 text-yellow-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.pendingClaims}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Portfolio ownership requests
                </p>
              </CardContent>
            </Card>

            {/* Total Artists Card */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Artists</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.totalArtists}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Registered profiles
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
                <CardDescription className="text-gray-400">
                  Common administrative tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <button
                  onClick={() => router.push('/admin/artists')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                >
                  <Users className="h-5 w-5 text-purple-400" />
                  <div>
                    <div className="font-medium text-white">아티스트 관리</div>
                    <div className="text-xs text-gray-400">Edit artist portfolios</div>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/bulk-upload')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                >
                  <Upload className="h-5 w-5 text-green-400" />
                  <div>
                    <div className="font-medium text-white">Upload Portfolio Data</div>
                    <div className="text-xs text-gray-400">Import artists via CSV</div>
                  </div>
                </button>
                <button
                  onClick={() => router.push('/admin/claims')}
                  className="w-full flex items-center gap-3 p-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 transition-colors text-left"
                >
                  <FileCheck className="h-5 w-5 text-yellow-400" />
                  <div>
                    <div className="font-medium text-white">Review Claims</div>
                    <div className="text-xs text-gray-400">Manage portfolio ownership requests</div>
                  </div>
                </button>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">System Info</CardTitle>
                <CardDescription className="text-gray-400">
                  Platform status and information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
                  <span className="text-sm text-gray-400">Platform Status</span>
                  <span className="text-sm font-medium text-green-400">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800">
                  <span className="text-sm text-gray-400">Database</span>
                  <span className="text-sm font-medium text-green-400">Connected</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
