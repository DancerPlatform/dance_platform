'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function ArtistSettingsPage() {
  const [currentArtistId, setCurrentArtistId] = useState<string>('')
  const [newArtistId, setNewArtistId] = useState('')
  const [changeCount, setChangeCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingId, setIsCheckingId] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [idCheckResult, setIdCheckResult] = useState<{
    checked: boolean
    available: boolean
    message: string
  }>({
    checked: false,
    available: false,
    message: '',
  })
  const router = useRouter()

  useEffect(() => {
    checkAuthAndLoadData()
  }, [])

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      // Get artist data
      const { data: artistData, error: artistError } = await supabase
        .from('artist_user')
        .select('artist_id, artist_id_change_count')
        .eq('auth_id', session.user.id)
        .single()

      if (artistError || !artistData) {
        setError('Portfolio not found. Please create or claim a portfolio first.')
        setIsLoading(false)
        return
      }

      setCurrentArtistId(artistData.artist_id)
      setChangeCount(artistData.artist_id_change_count || 0)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load portfolio data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckId = async () => {
    if (!newArtistId.trim()) {
      setIdCheckResult({
        checked: true,
        available: false,
        message: 'Please enter a new artist ID',
      })
      return
    }

    if (newArtistId === currentArtistId) {
      setIdCheckResult({
        checked: true,
        available: false,
        message: 'New ID must be different from current ID',
      })
      return
    }

    setIsCheckingId(true)
    setIdCheckResult({
      checked: false,
      available: false,
      message: '',
    })

    try {
      const response = await fetch(
        `/api/check-artist-id?artist_id=${encodeURIComponent(newArtistId)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to check ID')
      }

      setIdCheckResult({
        checked: true,
        available: data.available,
        message: data.available
          ? 'This ID is available!'
          : 'This ID is already taken. Please try another one.',
      })
    } catch (error) {
      setIdCheckResult({
        checked: true,
        available: false,
        message: 'Failed to check ID availability. Please try again.',
      })
    } finally {
      setIsCheckingId(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    if (!idCheckResult.checked || !idCheckResult.available) {
      setError('Please verify that the new Artist ID is available')
      setIsSubmitting(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/portfolio/update-artist-id', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          old_artist_id: currentArtistId,
          new_artist_id: newArtistId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update artist ID')
      }

      setSuccess('Artist ID updated successfully! Redirecting to your new portfolio...')

      // Redirect to new portfolio after a short delay
      setTimeout(() => {
        router.push(`/${newArtistId}`)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewArtistId(e.target.value)
    setError(null)
    setSuccess(null)

    // Reset ID check result if input changes
    if (idCheckResult.checked) {
      setIdCheckResult({
        checked: false,
        available: false,
        message: '',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  const canChangeId = changeCount < 1

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Portfolio Settings</h1>
          <p className="text-gray-400">Manage your artist portfolio settings</p>
        </div>

        {/* Success Message */}
        {success && (
          <Alert className="bg-green-500/10 border-green-500/50 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">{success}</AlertDescription>
          </Alert>
        )}

        {/* Error Message */}
        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Current Artist ID */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardHeader>
            <CardTitle>Current Artist ID</CardTitle>
            <CardDescription className="text-gray-400">
              Your unique identifier and URL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 p-4 rounded-lg">
              <p className="text-sm text-gray-400 mb-1">Artist ID:</p>
              <p className="text-lg font-mono font-semibold">{currentArtistId}</p>
              <p className="text-sm text-gray-500 mt-2">
                URL: danceplatform.com/{currentArtistId}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Change Artist ID */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Change Artist ID</CardTitle>
            <CardDescription className="text-gray-400">
              You can change your artist ID once
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!canChangeId ? (
              <Alert className="bg-yellow-500/10 border-yellow-500/50">
                <AlertTriangle className="h-4 w-4 text-yellow-400" />
                <AlertDescription className="text-yellow-400">
                  You have already used your one-time artist ID change. Your artist ID cannot be changed again.
                </AlertDescription>
              </Alert>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-400">
                    You have <strong>one (1)</strong> chance to change your artist ID. Choose carefully.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="newArtistId" className="text-white">
                    New Artist ID <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="newArtistId"
                      name="newArtistId"
                      type="text"
                      placeholder="Enter new artist ID"
                      value={newArtistId}
                      onChange={handleChange}
                      required
                      disabled={isSubmitting}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                    />
                    <Button
                      type="button"
                      onClick={handleCheckId}
                      disabled={isSubmitting || isCheckingId || !newArtistId.trim()}
                      className="bg-white/20 text-white hover:bg-white/30 whitespace-nowrap"
                    >
                      {isCheckingId ? 'Checking...' : 'Check'}
                    </Button>
                  </div>
                  {idCheckResult.checked && (
                    <p
                      className={`text-xs ${
                        idCheckResult.available ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {idCheckResult.message}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-white text-black hover:bg-white/90 h-12 text-lg"
                  disabled={isSubmitting || !idCheckResult.available}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Artist ID (One-time Change)'
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Warning: This action cannot be undone. After changing your artist ID once, you will not be able to change it again.
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
