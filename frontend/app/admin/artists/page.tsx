'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, Edit, Search, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Artist {
  artist_id: string
  artist_name: string | null
  artist_name_eng: string | null
  introduction: string | null
  photo: string | null
  instagram: string | null
  twitter: string | null
  youtube: string | null
  is_hidden: boolean | null
}

export default function ArtistsManagementPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [artists, setArtists] = useState<Artist[]>([])
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
        await fetchArtists()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchArtists = async () => {
    try {
      // Fetch all artist portfolios
      const { data: artistsData, error: artistsError } = await supabase
        .from('artist_portfolio')
        .select('artist_id, artist_name, artist_name_eng, introduction, photo, instagram, twitter, youtube, is_hidden')
        .order('artist_name', { ascending: true, nullsFirst: false })

      if (artistsError) throw artistsError

      setArtists(artistsData || [])
    } catch (err) {
      console.error('Failed to fetch artists:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch artists')
    }
  }

  const toggleHidden = async (artistId: string, currentHiddenState: boolean | null) => {
    try {
      // Optimistic update
      setArtists(prevArtists =>
        prevArtists.map(artist =>
          artist.artist_id === artistId
            ? { ...artist, is_hidden: !currentHiddenState }
            : artist
        )
      )

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(`/api/artists/${artistId}/toggle-hidden`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ is_hidden: !currentHiddenState }),
      })

      if (!response.ok) {
        throw new Error('Failed to toggle hidden status')
      }
    } catch (err) {
      console.error('Failed to toggle hidden status:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle hidden status')
      // Revert optimistic update on error
      await fetchArtists()
    }
  }

  const filteredArtists = artists.filter(artist =>
    artist.artist_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artist_name_eng?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.artist_id.toLowerCase().includes(searchTerm.toLowerCase())
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
            <h1 className="text-4xl font-bold mb-2">아티스트 관리</h1>
            <p className="text-gray-400">Manage artist portfolios</p>
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
                placeholder="Search artists by name, English name, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-600"
              />
            </div>
          </div>

          {/* Artists Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtists.map((artist) => (
              <Card
                key={artist.artist_id}
                className={`bg-zinc-900 border-zinc-800 hover:border-green-600/50 transition-colors cursor-pointer ${
                  artist.is_hidden ? 'opacity-60' : ''
                }`}
                onClick={() => router.push(`/edit-portfolio/${artist.artist_id}`)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {artist.photo ? (
                        <img
                          src={artist.photo}
                          alt={artist.artist_name || artist.artist_id}
                          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl text-gray-400">
                            {(artist.artist_name || artist.artist_id).charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <CardTitle className="text-white text-lg">
                          {artist.artist_name || artist.artist_id}
                        </CardTitle>
                        {artist.artist_name_eng && (
                          <CardDescription className="text-gray-400 text-sm">
                            {artist.artist_name_eng}
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleHidden(artist.artist_id, artist.is_hidden)
                      }}
                      className="flex-shrink-0 p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                      title={artist.is_hidden ? 'Show artist' : 'Hide artist'}
                    >
                      {artist.is_hidden ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-green-400" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">ID: {artist.artist_id}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        router.push(`/edit-portfolio/${artist.artist_id}`)
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

          {filteredArtists.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400">
                {searchTerm ? 'No artists found matching your search.' : 'No artists available.'}
              </p>
            </div>
          )}

          {/* Stats */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-sm text-gray-400">
              Showing {filteredArtists.length} of {artists.length} artists
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
