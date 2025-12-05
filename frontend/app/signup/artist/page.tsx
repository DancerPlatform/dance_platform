'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Header } from '@/components/header'
import { Music } from 'lucide-react'
import { signUp } from '@/lib/auth'
import Link from 'next/link'

export default function ArtistSignupPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    birth: '',
    artistId: '',
  })
  const [isLoading, setIsLoading] = useState(false)
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

  const handleCheckId = async () => {
    if (!formData.artistId.trim()) {
      setIdCheckResult({
        checked: true,
        available: false,
        message: 'Please enter an ID',
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
      const response = await fetch(`/api/check-artist-id?artist_id=${encodeURIComponent(formData.artistId)}`)
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    // Validate password strength
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    const { user, error: signUpError } = await signUp(
      formData.email,
      formData.password,
      'artist',
      {
        name: formData.name,
        phone: formData.phone || undefined,
        birth: formData.birth || undefined,
        artist_id: formData.artistId,
      }
    )

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (user) {
      // Redirect to artist login or profile page
      router.push('/login/artist?signup=success')
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

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Header />
      <div className="w-full max-w-md bg-black/80 py-20 border-white/20 flex flex-col gap-6">
        <CardHeader className="text-center text-white space-y-2">
          <div className="flex justify-center mb-2">
            <Music className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-3xl">Dancer Sign Up</CardTitle>
          <CardDescription className="text-gray-400">
            Create your dancer account
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
              <Label htmlFor="name" className="text-white">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="artistId" className="text-white">
                Artist ID <span className="text-red-500">*</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="artistId"
                  name="artistId"
                  type="text"
                  placeholder="Enter your artist ID"
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
                  {isCheckingId ? '확인 중...' : '중복확인'}
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
                This will be your unique artist identifier
              </p>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">
                Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLoading}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              <p className="text-xs text-gray-400">Must be at least 6 characters</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-white">
                Confirm Password <span className="text-red-500">*</span>
              </Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/login/artist" className="text-sm text-gray-400 hover:text-white transition-colors">
              Already have an account? Sign in
            </Link>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
