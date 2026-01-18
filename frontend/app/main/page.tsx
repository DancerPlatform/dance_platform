'use client'
import { useState } from 'react'
import useSWR from 'swr'
import Link from "next/link"
import { ArrowRight, Menu, Search } from "lucide-react"
import { ArtistCard } from "@/components/artist-card";
import { GroupCard } from "@/components/group-card";
import { SlidingBanner, BannerItem } from "@/components/sliding-banner";
import { SideMenu } from "@/components/side-menu";
import { Artist } from "@/types/artist"
import { useRouter } from 'next/navigation'
import { useAuth } from '@/stores/authStore'

interface Group {
  group_id: string;
  group_name: string;
  group_name_eng?: string;
  photo?: string;
  member_count: number;
}

export default function MainPage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const router = useRouter();
  const { artistUser, clientUser, normalUser } = useAuth();
  const { data: artistData, error: artistError, isLoading: artistLoading } = useSWR<{ artists: Artist[] }>('/api/artists?limit=4', fetcher)
  const { data: groupData, error: groupError, isLoading: groupLoading } = useSWR<{ groups: Group[] }>('/api/groups?limit=4', fetcher)

  // Get user name from any user type
  const userName = artistUser?.name || clientUser?.name || normalUser?.name

  const artists = artistData?.artists || [];
  const groups = groupData?.groups || [];

  if (artistError || groupError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Failed to load data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-30 select-none">
      {/* Side Menu */}
      <SideMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />

      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <button className="rounded-full" onClick={() => setIsMenuOpen(true)}>
          <Menu className='size-6 md:size-8'/>
        </button>
        <h1 className="text-2xl md:text-3xl font-bold">dancers<span className='text-green-500'>.</span>bio</h1>
        <button className="rounded-full" onClick={() => {router.push("/main/search")}}>
          <Search className='size-6 md:size-8'/>
        </button>
      </header>

      <main className="space-y-5">

        {/* Portfolio Banner */}
        <section className="px-6">
          {userName ? (
            <Link href="/main/profile">
              <div className="h-14 bg-linear-to-r from-zinc-900 via-zinc-800 to-green-600/80 rounded-lg flex items-center justify-between px-4 border border-zinc-800 hover:border-green-500/50 transition-all">
                <div>
                  <p className="text-sm md:text-base font-bold">Welcome back, {userName}</p>
                </div>
                <ArrowRight className="size-5" />
              </div>
            </Link>
          ) : (
            <Link href="/login/artist">
              <div className="h-14 bg-linear-to-r from-zinc-900 via-zinc-800 to-green-600/80 rounded-lg flex items-center justify-between px-4 border border-zinc-800 hover:border-green-500/50 transition-all">
                <div>
                  <p className="text-sm md:text-base font-bold">Create Your Portfolio<span className="font-normal text-white/80"> or claim an existing one</span></p>
                </div>
                <ArrowRight className="size-5" />
              </div>
            </Link>
          )}
        </section>

        {/* Hero Section */}
        <section className="px-6">
          <h2 className="text-3xl md:text-4xl font-normal">
            Discover
            <span className="font-bold"> Dancers</span>
          </h2>
        </section>

        {/* Popular Artists Section */}
        <section className="space-y-4 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-normal">Popular Dancers</h3>
            <Link
              href="/main/search"
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors text-sm"
            >
              <span className='text-green-500'>View All</span>
              <ArrowRight className="size-4 text-green-500" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex gap-4">
            {
              artistLoading ?
              Array(4).fill(0).map((_, index) => (
                <div key={index} className='w-full bg-gray-950 animate-pulse aspect-3/4 rounded-lg'></div>
              ))
            :
            artists.map((artist, index) => (
              <ArtistCard
                key={`${artist.artist_id}-${index}`}
                artistId={artist.artist_id}
                nameEN={artist.artist_name_eng}
                nameKR={artist.artist_name}
                imageUrl={artist.photo}
                className="max-w-xs"
              />
            ))
          }
          </div>
        </section>

        {/* Groups Section */}
        {groups.length > 0 && (
          <section className="space-y-4 px-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-normal">Groups & Crews</h3>
              <Link
                href="/main/search"
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm"
              >
                <span className='text-green-500'>View All</span>
              <ArrowRight className="size-4 text-green-500" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex gap-4">
              {
              groupLoading ?
              Array(4).fill(0).map((_, index) => (
                <div key={index} className='w-full bg-gray-950 animate-pulse aspect-3/4 rounded-lg'></div>
              ))
              :
              groups.map((group) => (
                <GroupCard
                  key={group.group_id}
                  groupId={group.group_id}
                  nameEN={group.group_name_eng}
                  nameKR={group.group_name}
                  imageUrl={group.photo || null}
                  memberCount={group.member_count}
                  className="max-w-xs"
                />
              ))
              }
            </div>
          </section>
        )}
      </main>
    </div>
  )

}