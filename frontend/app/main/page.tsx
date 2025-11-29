import { Input } from "@/components/ui/input"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Card } from "@/components/ui/card"
import { ArtistCard } from "@/components/artist-card";

export default function MainPage() {
  const popularArtists = [1, 2, 3, 4];
  const risingArtists = [1, 2];


  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold">dee&apos;tz</h1>
        <div className="w-12 h-12 bg-zinc-700 rounded-full" />
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

          <div className="grid grid-cols-2 gap-4">
            {popularArtists.map((artist) => (
              <Card
                key={artist}
                className="aspect-square bg-zinc-800 border-0 rounded-3xl hover:bg-zinc-700 transition-colors cursor-pointer"
              />
            ))}
          </div>
        </section>

        {/* Rising Artists Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-normal">Rising Artists</h3>
            <Link
              href="/artists/rising"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ArtistCard
                    nameEN="Renan"
                    nameKR="레난"
                    genre="Hiphop"
                    imageUrl="/artists/renan.jpg"
                    className="max-w-sm"
                  />
          </div>
        </section>
      </main>

      {/* Bottom Navigation */}
      {/* <BottomNav /> */}
    </div>
  )

}