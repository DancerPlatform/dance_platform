'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Users } from 'lucide-react'
import { useAuth } from '@/stores/authStore'

export default function ClientLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const { error: signInError, profile: userProfile } = await signIn(email, password)

    if (signInError) {
      setError(signInError.message)
      setIsLoading(false)
      return
    }

    // Check if user is a client
    if (userProfile?.user_type !== 'client') {
      setError('This account is not registered as a client')
      setIsLoading(false)
      return
    }

    // Redirect to client dashboard
    router.push('/main')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Header />
      <Card className="w-full max-w-md bg-black/80 px-4 py-20 border-white/20">
        <CardHeader className="text-center text-white space-y-2">
          <div className="flex justify-center mb-2">
            <Users className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl">Client Login</CardTitle>
          <CardDescription className="text-gray-400">
            Sign in to your client account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-2 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-white/90 h-12 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <a href="/signup/client" className="text-sm text-gray-400 hover:text-white transition-colors">
              Don&apos;t have an account? Sign up
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
