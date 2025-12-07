'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function CreatePortfolioPage() {
  const { refreshUser } = useAuth()
  const [formData, setFormData] = useState({
    artistId: '',
    name: '',
    phone: '',
    birth: '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCheckingId, setIsCheckingId] = useState(false)
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
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      // Pre-fill name, phone, birth from auth metadata if available
      const metadata = session.user.user_metadata
      setFormData(prev => ({
        ...prev,
        name: metadata.name || '',
        phone: metadata.phone || '',
        birth: metadata.birth || '',
      }))

      // Check if user already has a portfolio
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_portfolio')
        .eq('auth_id', session.user.id)
        .single()

      if (profile?.has_portfolio) {
        router.push('/artist/portfolio-setup')
        return
      }
    } catch (error) {
      console.error('Error checking auth:', error)
    } finally {
      setIsCheckingAuth(false)
    }
  }

  const handleCheckId = async () => {
    if (!formData.artistId.trim()) {
      setIdCheckResult({
        checked: true,
        available: false,
        message: 'Please enter an artist ID',
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
        `/api/check-artist-id?artist_id=${encodeURIComponent(formData.artistId)}`
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
    setIsLoading(true)
    setError(null)

    // Validate artist ID is checked and available
    if (!formData.artistId.trim()) {
      setError('Artist ID is required')
      setIsLoading(false)
      return
    }

    if (!idCheckResult.checked) {
      setError('Please verify your Artist ID using the duplicate check button')
      setIsLoading(false)
      return
    }

    if (!idCheckResult.available) {
      setError('Please choose an available Artist ID')
      setIsLoading(false)
      return
    }

    if (!formData.name.trim()) {
      setError('Name is required')
      setIsLoading(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      const response = await fetch('/api/portfolio/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artist_id: formData.artistId,
          name: formData.name,
          phone: formData.phone || undefined,
          birth: formData.birth || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create portfolio')
      }

      // Success! Refresh user data to get the new artistUser info
      await refreshUser()

      // Add a small delay to ensure all database operations are complete
      await new Promise(resolve => setTimeout(resolve, 500))

      // Redirect to the new portfolio
      router.replace(`/edit-portfolio/${formData.artistId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Reset ID check result if artist ID is changed
    if (name === 'artistId' && idCheckResult.checked) {
      setIdCheckResult({
        checked: false,
        available: false,
        message: '',
      })
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <div className="max-w-2xl mx-auto px-6 py-20">
        {/* <Link
          href="/artist/portfolio-setup"
          className="inline-flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to options
        </Link> */}

        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-2xl">Create New Portfolio</CardTitle>
            <CardDescription className="text-gray-400">
              Set up your artist portfolio with a unique ID
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {/* Artist ID */}
              <div className="space-y-2">
                <Label htmlFor="artistId" className="text-white">
                  Artist ID <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="artistId"
                    name="artistId"
                    type="text"
                    placeholder="Enter your unique artist ID"
                    value={formData.artistId}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                  />
                  <Button
                    type="button"
                    onClick={handleCheckId}
                    disabled={isLoading || isCheckingId || !formData.artistId.trim()}
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
                <p className="text-xs text-gray-400">
                  This will be your unique identifier and URL: danceplatform.com/{formData.artistId || 'your-id'}
                </p>
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name" className="text-white">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-white">
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              {/* Birth */}
              <div className="space-y-2">
                <Label htmlFor="birth" className="text-white">
                  Date of Birth
                </Label>
                <Input
                  id="birth"
                  name="birth"
                  type="date"
                  value={formData.birth}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Portfolio...
                  </>
                ) : (
                  'Create Portfolio'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
