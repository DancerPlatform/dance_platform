'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Edit, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Team {
  team_id: string
  team_name: string | null
  team_introduction: string | null
  photo: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  leader_id: string | null
  subleader_id: string | null
}

export default function TeamsManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [searchTerm, setSearchTerm] = useState('')
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
        await fetchTeams()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTeams = async () => {
    try {
      // Fetch all team portfolios
      const { data: teamsData, error: teamsError } = await supabase
        .from('team_portfolio')
        .select('team_id, team_name, team_introduction, photo, instagram, twitter, youtube, leader_id, subleader_id')
        .order('team_name', { ascending: true, nullsFirst: false })

      if (teamsError) throw teamsError

      setTeams(teamsData || [])
    } catch (err) {
      console.error('Failed to fetch teams:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch teams')
    }
  }

  const filteredTeams = teams.filter(team =>
    team.team_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    team.team_id.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
            <h1 className="text-4xl font-bold mb-2">팀 관리</h1>
            <p className="text-gray-400">Manage team portfolios</p>
          </div>

          {error && (
            <Alert className="bg-red-500/10 border-red-500/50 mb-6">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-400">{error}</AlertDescription>
            </Alert>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search teams by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* Teams Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team) => (
              <Card
                key={team.team_id}
                className="bg-zinc-900 border-zinc-800 hover:border-green-600/50 transition-colors cursor-pointer"
                onClick={() => router.push(`/edit-team/${team.team_id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {team.photo ? (
                        <img
                          src={team.photo}
                          alt={team.team_name || team.team_id}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                          <span className="text-xl text-gray-400">
                            {(team.team_name || team.team_id).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-white text-lg">
                          {team.team_name || team.team_id}
                        </CardTitle>
                        {team.team_introduction && (
                          <CardDescription className="text-gray-400 text-sm line-clamp-1">
                            {team.team_introduction}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Edit className="h-5 w-5 text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">ID: {team.team_id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/edit-team/${team.team_id}`)
                      }}
                      className="text-sm text-green-400 hover:text-green-300 transition-colors"
                    >
                      Edit Portfolio →
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTeams.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm ? 'No teams found matching your search.' : 'No teams available.'}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-sm text-gray-400">
              Showing {filteredTeams.length} of {teams.length} teams
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
