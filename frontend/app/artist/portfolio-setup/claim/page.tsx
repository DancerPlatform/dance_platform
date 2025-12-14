'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { ArrowLeft, Search, Loader2, User } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'

interface Portfolio {
  artist_id: string
  name: string
  artist_name: string
  artist_name_eng?: string
  photo?: string
  email: string
  phone?: string
}

export default function ClaimPortfolioPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null)
  const [claimPhone, setClaimPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [authenticationCode, setAuthenticationCode] = useState<string | null>(null)
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (searchQuery.trim().length < 2) {
      setError('Please enter at least 2 characters to search')
      return
    }

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    try {
      const response = await fetch(
        `/api/portfolio/search?q=${encodeURIComponent(searchQuery)}`
      )
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to search portfolios')
      }

      setPortfolios(data.portfolios || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setPortfolios([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectPortfolio = (portfolio: Portfolio) => {
    setSelectedPortfolio(portfolio)
    setError(null)
    setSuccess(null)
  }

  const handleSubmitClaim = async () => {
    if (!selectedPortfolio) return

    setIsSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        setIsSubmitting(false)
        return
      }

      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artist_id: selectedPortfolio.artist_id,
          requester_phone: claimPhone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim request')
      }

      // Store the authentication code from the response
      setAuthenticationCode(data.claim?.authentication_code || null)
      setSuccess('Claim request submitted successfully!')
      setClaimPhone('')
      setSearchQuery('')
      setPortfolios([])
      setHasSearched(false)
      router.replace('/main/profile')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
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

      <div className="max-w-4xl mx-auto px-6 pb-12 pt-16 space-y-3">

        <div className="">
          <h1 className="text-2xl font-bold mb-1">Claim Existing Portfolio</h1>
          <p className="text-gray-400 text-sm">
            Search for your portfolio and submit a claim request
          </p>
        </div>

        {/* Success Message with Authentication Code */}
        {success && authenticationCode && (
          <Card className="bg-zinc-900 border-green-500/50">
            <CardContent className="pt-6 space-y-4">
              <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded">
                {success}
              </div>

              <div className="bg-blue-500/10 border-2 border-blue-500/50 rounded-lg p-4 space-y-3">
                <p className="text-sm font-semibold text-blue-400">Your Authentication Code:</p>
                <div className="bg-black/30 rounded px-4 py-3 text-center">
                  <p className="text-3xl font-bold text-white tracking-wider font-mono">
                    {authenticationCode}
                  </p>
                </div>
                <p className="text-sm text-gray-300">
                  Send us your authentication code through your official artist account on Instagram.
                </p>
              </div>

              <Button
                onClick={() => router.push('/artist/my-claims')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                Go to My Claims
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Search Form */}
        {!authenticationCode && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle>Search for Portfolio</CardTitle>
            <CardDescription className="text-gray-400">
              Enter your artist ID or name
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Search by artist ID or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isSearching}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              <Button
                type="submit"
                disabled={isSearching || searchQuery.trim().length < 2}
                className="bg-white text-black hover:bg-white/90 whitespace-nowrap"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Search
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>)}

        {/* Search Results */}
        {hasSearched && (
          <div className="space-y-2">
            {portfolios.length === 0 ? (
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="py-8 text-center text-gray-400">
                  No unclaimed portfolios found. Try a different search term.
                </CardContent>
              </Card>
            ) : (
              <>
                <h2 className="text-xl font-semibold">Search Results ({portfolios.length})</h2>
                {portfolios.map((portfolio) => (
                  <Card
                    key={portfolio.artist_id}
                    className="bg-zinc-900 border-zinc-800 hover:border-white/20 transition-colors py-3 rounded-sm"
                  >
                    <CardContent className=" px-3">
                      <div className="flex items-center gap-4">
                        {/* Photo */}
                        <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center overflow-hidden border-white border">
                          {portfolio.photo ? (
                            <Image
                              src={portfolio.photo}
                              alt={portfolio.artist_name}
                              width={64}
                              height={64}
                              className="object-cover w-full h-full object-top"
                            />
                          ) : (
                            <User className="w-8 h-8 text-gray-500" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{portfolio.artist_name}</h3>
                          {portfolio.artist_name_eng && (
                            <p className="text-sm text-gray-400">{portfolio.artist_name_eng}</p>
                          )}
                          <p className="text-sm text-gray-500">ID: {portfolio.artist_id}</p>
                        </div>

                        {/* Action */}
                        <Button
                          onClick={() => handleSelectPortfolio(portfolio)}
                          variant="outline"
                          className="bg-transparent border-white/20 text-white hover:bg-white/10"
                        >
                          Select
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </>
            )}
          </div>
        )}

        {/* Claim Form */}
        {selectedPortfolio && (
          <Card className="bg-zinc-900 border-zinc-800 mt-6">
            <CardHeader>
              <CardTitle>Submit Claim Request</CardTitle>
              <CardDescription className="text-gray-400">
                Verify your information to claim this portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <p className="text-sm text-gray-400 mb-2">Selected Portfolio:</p>
                <p className="font-semibold text-white">{selectedPortfolio.artist_name}</p>
                <p className="text-sm text-gray-500">ID: {selectedPortfolio.artist_id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitClaim}
                  disabled={isSubmitting}
                  className="flex-1 bg-white text-black hover:bg-white/90"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim Request'
                  )}
                </Button>
                <Button
                  onClick={() => setSelectedPortfolio(null)}
                  disabled={isSubmitting}
                  variant="outline"
                  className="bg-transparent border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
        
      </div>
    </div>
  )
}
