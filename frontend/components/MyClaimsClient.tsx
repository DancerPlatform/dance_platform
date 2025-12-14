'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PortfolioClaimRequestWithArtist } from '@/lib/types/claims'
import { useAuth } from '@/contexts/AuthContext'

export default function MyClaimsClients() {
  const [claims, setClaims] = useState<PortfolioClaimRequestWithArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const {signOut} = useAuth();

  useEffect(() => {
    fetchClaims()
  }, [])

  const fetchClaims = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      const response = await fetch('/api/claims', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data = await response.json()
      setClaims(data.claims || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </Badge>
        )
      case 'approved':
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Approved
          </Badge>
        )
      case 'rejected':
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </Badge>
        )
      case 'cancelled':
        return (
          <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
            Cancelled
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getStatusMessage = (claim: PortfolioClaimRequestWithArtist) => {
    switch (claim.status) {
      case 'pending':
        return (
          <Alert className="bg-blue-500/10 border-blue-500/30">
            <AlertCircle className="h-4 w-4 text-blue-400" />
            <AlertDescription className="text-blue-400 text-sm">
              Your claim is pending admin review. You&apos;ll be notified once it&apos;s processed.
            </AlertDescription>
          </Alert>
        )
      case 'approved':
        return (
          <Alert className="bg-green-500/10 border-green-500/30">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400 text-sm">
              Your claim has been approved! You can now manage this portfolio.
            </AlertDescription>
          </Alert>
        )
      case 'rejected':
        return (
          <Alert className="bg-red-500/10 border-red-500/30">
            <XCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400 text-sm">
              Your claim was rejected.
              {claim.rejection_reason && (
                <span className="block mt-1 font-medium">
                  Reason: {claim.rejection_reason}
                </span>
              )}
            </AlertDescription>
          </Alert>
        )
      default:
        return null
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-30">
      {/* <Header onBack={() => {router.replace('/main')}}/> */}

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-2">
        <div className="">
          <h1 className="text-2xl font-bold">My Claim Requests</h1>
          <p className="text-gray-400 text-sm">Track the status of your portfolio claim requests</p>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {claims.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="py-12 text-center px-2">
              <div className="max-w-md mx-auto space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-8 h-8 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">No Claims Yet</h3>
                  <p className="text-gray-400 mb-6">
                    You haven&apos;t submitted any portfolio claim requests.
                  </p>
                  <Button asChild className="bg-blue-600 hover:bg-blue-700">
                    <Link href="/">
                      Browse Portfolios
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {claims.map((claim) => (
              <Card key={claim.claim_id} className="bg-zinc-900 border-zinc-800 p-2">
                <CardHeader className='px-2'>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">
                        {claim.artist_user.name}
                      </CardTitle>
                      <CardDescription className="text-gray-400 mt-1">
                        Portfolio ID: {claim.artist_id}
                      </CardDescription>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-2">
                  {getStatusMessage(claim)}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500 mb-1">Request Submitted</p>
                      <p className="text-white">
                        {new Date(claim.created_at).toLocaleString()}
                      </p>
                    </div>
                    {claim.reviewed_at && (
                      <div>
                        <p className="text-gray-500 mb-1">
                          {claim.status === 'approved' ? 'Approved On' : 'Reviewed On'}
                        </p>
                        <p className="text-white">
                          {new Date(claim.reviewed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <p className="text-gray-500 mb-1">Your Email</p>
                      <p className="text-white">{claim.requester_email}</p>
                    </div>
                    {claim.requester_phone && (
                      <div>
                        <p className="text-gray-500 mb-1">Your Phone</p>
                        <p className="text-white">{claim.requester_phone}</p>
                      </div>
                    )}
                  </div>

                  {claim.status === 'approved' && (
                    <div className="pt-4">
                      <Button asChild className="bg-blue-600 hover:bg-blue-700">
                        <Link href={`/${claim.artist_id}`}>
                          View Portfolio
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <button className='mx-auto w-full py-3 text-red-400 text-center' onClick={signOut}>Logout</button>
    </div>
  )
}
