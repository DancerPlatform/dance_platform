'use client'
import useSWR from 'swr'
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ArtistCard } from "@/components/artist-card";
import { Artist } from "@/types/artist"

export default function MainPage() {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const { data, error, isLoading } = useSWR<{ artists: Artist[] }>('/api/artists?limit=4', fetcher)

  const artists = data?.artists || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Loading artists...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Failed to load artists</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold">dee&apos;tz</h1>
        {/* <div className="w-12 h-12 bg-zinc-700 rounded-full" /> */}
      </header>

      <main className="px-6 space-y-8">
        {/* Hero Section */}
        <section className="space-y-4">
          <h2 className="text-4xl font-normal">
            Discover<br />
            Our <span className="font-bold">Artists</span>
          </h2>

          {/* Search Bar */}
          <div className="relative">
            <Input
              placeholder="Search artists..."
              className="w-full h-16 bg-zinc-800 border-2 border-white rounded-full px-6 text-white placeholder:text-zinc-400 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
        </section>

        {/* Popular Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-normal">Popular Artists</h3>
            <Link
              href="/artists/popular"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:flex gap-4">
            {artists.map((artist) => (
              <ArtistCard
                key={artist.artist_id}
                artistId={artist.artist_id}
                nameEN={artist.artist_name_eng}
                nameKR={artist.artist_name}
                imageUrl={artist.photo}
                className="max-w-xs"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  )

}