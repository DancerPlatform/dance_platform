'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ClaimPortfolioButtonProps {
  artistId: string
  artistName: string
  isUnclaimed: boolean
}

export function ClaimPortfolioButton({
  artistId,
  artistName,
  isUnclaimed,
}: ClaimPortfolioButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [phone, setPhone] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setError(null)

    try {
      // Check if user is logged in
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        // Redirect to login with return URL
        router.push(`/login/artist?redirect=/claim/${artistId}`)
        return
      }

      // Submit claim request
      const response = await fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          artist_id: artistId,
          requester_phone: phone || undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim request')
      }

      setSuccess(true)
      setTimeout(() => {
        setIsOpen(false)
        router.push('/my-claims')
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isUnclaimed) {
    return null
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        Claim This Portfolio
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800">
          <DialogHeader>
            <DialogTitle>Claim Portfolio</DialogTitle>
            <DialogDescription className="text-gray-400">
              Request to claim the portfolio for {artistName}
            </DialogDescription>
          </DialogHeader>

          {success ? (
            <Alert className="bg-green-500/10 border-green-500/50 text-green-400">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Claim request submitted successfully! Redirecting to your claims page...
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-gray-300">
                    Your Phone Number (Optional)
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                    className="bg-zinc-800 border-zinc-700 text-white placeholder:text-gray-500"
                  />
                  <p className="text-xs text-gray-500">
                    This will be sent to the admin for verification
                  </p>
                </div>

                <Alert className="bg-blue-500/10 border-blue-500/50">
                  <AlertCircle className="h-4 w-4 text-blue-400" />
                  <AlertDescription className="text-blue-400 text-sm">
                    Your request will be manually reviewed by an admin. You&apos;ll be notified once it&apos;s approved.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert className="bg-red-500/10 border-red-500/50">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={isSubmitting}
                  className="bg-transparent border-zinc-700 text-white hover:bg-zinc-800"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
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
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
