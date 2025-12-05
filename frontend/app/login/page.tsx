
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Music, User } from 'lucide-react'
import { Header } from '@/components/header'
import Link from 'next/link'
import { redirect } from 'next/navigation'
// import { redirect } from 'next/dist/server/api-utils'

type UserType = 'client' | 'artist' | 'user' | null

export default function LoginPage() {
  const [selectedType, setSelectedType] = useState<UserType>(null)

  useEffect(() => {
    redirect("/login/artist");
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <Header />
      <Card className="w-full max-w-md bg-black/80 px-4 py-20 border-none flex items-center justify-center">
        <CardHeader className="text-center text-white w-full">
          <CardTitle className="text-3xl">Welcome Back</CardTitle>
          <CardDescription>
            Select your account type to continue
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 text-white">
          <Button
            variant={selectedType === 'client' ? 'outline' : 'default'}
            size="lg"
            className="w-full justify-start text-lg h-16"
            onClick={() => setSelectedType('client')}
          >
            <Users className="mr-3 h-6 w-6" />
            Client
          </Button>

          <Button
            variant={selectedType === 'artist' ? 'outline' : 'default'}
            size="lg"
            className="w-full justify-start text-lg h-16"
            onClick={() => setSelectedType('artist')}
          >
            <Music className="mr-3 h-6 w-6" />
            Dancer
          </Button>

          <Button
            variant={selectedType === 'user' ? 'outline' : 'default'}
            size="lg"
            className="w-full justify-start text-lg h-16"
            onClick={() => setSelectedType('user')}
          >
            <User className="mr-3 h-6 w-6" />
            User
          </Button>

        </CardContent>
        <Link
          href={`/login/${selectedType}`}
          className={`w-xs justify-center rounded-2xl hover:bg-white/50 bg-white duration-300 text-black transition-colors text-lg py-3 ${selectedType ? "flex" : "hidden"}`}
        >
          Continue
        </Link>
      </Card>
    </div>
  )
}