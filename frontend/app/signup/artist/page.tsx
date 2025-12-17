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
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [emailValidation, setEmailValidation] = useState<{
    isChecking: boolean
    checked: boolean
    available: boolean
    message: string
  }>({
    isChecking: false,
    checked: false,
    available: false,
    message: '',
  })
  const [phoneValidation, setPhoneValidation] = useState<{
    isChecking: boolean
    checked: boolean
    available: boolean
    message: string
  }>({
    isChecking: false,
    checked: false,
    available: false,
    message: '',
  })
  const router = useRouter()

  const checkFieldAvailability = async (field: 'email' | 'phone', value: string) => {
    if (!value.trim()) {
      return { checked: false, available: false, message: '' }
    }

    try {
      const response = await fetch(`/api/check-user-field?field=${field}&value=${encodeURIComponent(value)}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to check ${field}`)
      }

      return {
        checked: true,
        available: data.available,
        message: data.available
          ? `This ${field} is available!`
          : `This ${field} is already registered. Please use another one.`,
      }
    } catch (error) {
      return {
        checked: true,
        available: false,
        message: `Failed to check ${field} availability. Please try again.`,
      }
    }
  }

  const handleEmailBlur = async () => {
    if (!formData.email.trim()) return

    setEmailValidation(prev => ({ ...prev, isChecking: true }))
    const result = await checkFieldAvailability('email', formData.email)
    setEmailValidation({
      isChecking: false,
      ...result,
    })
  }

  const handlePhoneBlur = async () => {
    if (!formData.phone.trim()) return

    setPhoneValidation(prev => ({ ...prev, isChecking: true }))
    const result = await checkFieldAvailability('phone', formData.phone)
    setPhoneValidation({
      isChecking: false,
      ...result,
    })
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Validate email availability
    if (emailValidation.checked && !emailValidation.available) {
      setError('Email is already registered. Please use another email.')
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
      }
    )

    if (signUpError) {
      setError(signUpError.message)
      setIsLoading(false)
      return
    }

    if (user) {
      // Redirect to profile page
      router.push('/main/profile')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))

    // Reset email validation if email is changed
    if (name === 'email' && emailValidation.checked) {
      setEmailValidation({
        isChecking: false,
        checked: false,
        available: false,
        message: '',
      })
    }

    // Reset phone validation if phone is changed
    if (name === 'phone' && phoneValidation.checked) {
      setPhoneValidation({
        isChecking: false,
        checked: false,
        available: false,
        message: '',
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Header />
      <div className="w-full max-w-md py-20 border-white/20 flex flex-col gap-6">
        <CardHeader className="text-center text-white space-y-2">
          <CardTitle className="text-3xl">Sign Up Now</CardTitle>
          <CardDescription className="text-gray-400">
            Create your dancer account
          </CardDescription>
        </CardHeader>

        <CardContent className='px-3'>
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
                onBlur={handleEmailBlur}
                required
                disabled={isLoading || emailValidation.isChecking}
                className="bg-white/10 border-white/20 text-white placeholder:text-gray-500"
              />
              {emailValidation.isChecking && (
                <p className="text-xs text-gray-400">Checking availability...</p>
              )}
              {emailValidation.checked && (
                <p
                  className={`text-xs ${
                    emailValidation.available ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {emailValidation.message}
                </p>
              )}
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

            <div className='w-full bg-black pt-6 border-t border-white/40'>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-white/90 h-12 text-lg"
                disabled={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </div>
          </form>

          <div className="text-center mt-3">
            <Link href="/login/artist" className="text-sm text-gray-400 hover:text-white transition-colors">
              Already have an account? <span className='text-white'>Sign in</span>
            </Link>
          </div>
        </CardContent>
      </div>
    </div>
  )
}
