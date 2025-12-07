'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminSidebar } from '@/components/AdminSidebar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle2, XCircle, Clock, Loader2, AlertCircle, CheckCheck, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { PortfolioClaimRequestWithArtist } from '@/lib/types/claims'

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState<PortfolioClaimRequestWithArtist[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [selectedClaim, setSelectedClaim] = useState<PortfolioClaimRequestWithArtist | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    checkAuthAndFetchClaims()
  }, [])

  const checkAuthAndFetchClaims = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        router.push('/login/artist')
        return
      }

      // Fetch claims
      const response = await fetch('/api/claims', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch claims')
      }

      const data = await response.json()

      setIsAdmin(data.is_admin)
      console.log(data)
      if (!data.is_admin) {
        setError('You do not have admin privileges')
        return
      }

      setClaims(data.claims || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (claimId: string) => {
    setActionLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/claims/${claimId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to approve claim')
      }

      // Refresh claims list
      await checkAuthAndFetchClaims()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleRejectClick = (claim: PortfolioClaimRequestWithArtist) => {
    setSelectedClaim(claim)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  const handleRejectConfirm = async () => {
    if (!selectedClaim) return

    setActionLoading(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const response = await fetch(`/api/claims/${selectedClaim.claim_id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          reason: rejectReason || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to reject claim')
      }

      setRejectDialogOpen(false)
      setSelectedClaim(null)

      // Refresh claims list
      await checkAuthAndFetchClaims()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30"><Clock className="w-3 h-3 mr-1" />Pending</Badge>
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getMatchIndicator = (matches: boolean | null) => {
    if (matches === null) return <span className="text-gray-500">-</span>
    return matches ? (
      <CheckCheck className="w-4 h-4 text-green-400" />
    ) : (
      <X className="w-4 h-4 text-red-400" />
    )
  }

  const pendingClaims = claims.filter(c => c.status === 'pending')
  const processedClaims = claims.filter(c => c.status !== 'pending')

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
          <h1 className="text-4xl font-bold mb-2">Portfolio Claim Requests</h1>
          <p className="text-gray-400">Review and manage portfolio ownership claims</p>
        </div>

        {error && (
          <Alert className="bg-red-500/10 border-red-500/50 mb-6">
            <AlertCircle className="h-4 w-4 text-red-400" />
            <AlertDescription className="text-red-400">{error}</AlertDescription>
          </Alert>
        )}

        {/* Pending Claims */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Pending ({pendingClaims.length})</h2>
          {pendingClaims.length === 0 ? (
            <Card className="bg-zinc-900 border-zinc-800">
              <CardContent className="py-8 text-center text-gray-400">
                No pending claims
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingClaims.map((claim) => (
                <Card key={claim.claim_id} className="bg-zinc-900 border-zinc-800 py-6">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl text-white">Trying to claim: {claim.artist_user.name}&apos;s profile</CardTitle>
                        <CardDescription className="text-gray-400">
                          Requestion to claim portfolio ID: {claim.artist_id}
                        </CardDescription>
                      </div>
                      {getStatusBadge(claim.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {/* <div>
                        <p className="text-gray-500 mb-1">Portfolio Email</p>
                        <p className="text-white">{claim.artist_user.email}</p>
                      </div> */}
                      <div>
                        <p className="text-gray-500 mb-1">Requester Email</p>
                        <div className="flex items-center gap-2">
                          <p className="text-white">{claim.requester_email}</p>
                          {/* {getMatchIndicator(claim.email_matches)} */}
                        </div>
                      </div>
                      {/* <div>
                        <p className="text-gray-500 mb-1">Portfolio Phone</p>
                        <p className="text-white">{claim.artist_user.phone || '-'}</p>
                      </div> */}
                      <div>
                        <p className="text-gray-500 mb-1">Requester Phone</p>
                        <div className="flex items-center gap-2">
                          <p className="text-white">{claim.requester_phone || '-'}</p>
                          {/* {getMatchIndicator(claim.phone_matches)} */}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500">
                      Requested: {new Date(claim.created_at).toLocaleString()}
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button
                        onClick={() => handleApprove(claim.claim_id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Approve'}
                      </Button>
                      <Button
                        onClick={() => handleRejectClick(claim)}
                        disabled={actionLoading}
                        variant="outline"
                        className="bg-transparent border-red-500/50 text-red-400 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Processed Claims */}
        {processedClaims.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {processedClaims.slice(0, 10).map((claim) => (
                <Card key={claim.claim_id} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-white">{claim.artist_user.name}</p>
                        <p className="text-sm text-gray-400">{claim.requester_email}</p>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(claim.status)}
                        {claim.reviewed_at && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(claim.reviewed_at).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    {claim.rejection_reason && (
                      <p className="text-sm text-red-400 mt-2">
                        Reason: {claim.rejection_reason}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>Reject Claim Request</DialogTitle>
            <DialogDescription className="text-gray-400">
              Provide a reason for rejecting this claim (optional)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-300">Rejection Reason</Label>
              <Textarea
                id="reason"
                placeholder="e.g., Email does not match, insufficient verification..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
              disabled={actionLoading}
              className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRejectConfirm}
              disabled={actionLoading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Claim'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
