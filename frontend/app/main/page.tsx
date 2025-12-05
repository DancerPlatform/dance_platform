'use client'
import useSWR from 'swr'
import Link from "next/link"
import { ArrowRight, Search } from "lucide-react"
import { ArtistCard } from "@/components/artist-card";
import { GroupCard } from "@/components/group-card";
import { SlidingBanner, BannerItem } from "@/components/sliding-banner";
import { Artist } from "@/types/artist"
import { useRouter } from 'next/navigation'

interface Group {
  group_id: string;
  group_name: string;
  group_name_eng?: string;
  photo?: string;
  member_count: number;
}

export default function MainPage() {
  const fetcher = (url: string) => fetch(url).then(res => res.json())
  const router = useRouter();
  const { data: artistData, error: artistError, isLoading: artistLoading } = useSWR<{ artists: Artist[] }>('/api/artists?limit=4', fetcher)
  const { data: groupData, error: groupError, isLoading: groupLoading } = useSWR<{ groups: Group[] }>('/api/groups?limit=4', fetcher)

  const artists = artistData?.artists || [];
  const groups = groupData?.groups || [];

  // Sample banner data - replace with your actual banner images
  const bannerItems: BannerItem[] = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1504609813442-a8924e83f76e?w=1200&h=400&fit=crop",
      title: "Featured Artists",
      description: "Discover the best dancers in the industry",
      link: "/artists/featured"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&h=400&fit=crop",
      title: "New Workshops",
      description: "Join our latest dance workshops and classes",
      link: "/workshops"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1534329539061-64caeb388c42?w=1200&h=400&fit=crop",
      title: "Upcoming Events",
      description: "Don't miss out on exclusive dance events",
      link: "/events"
    }
  ];

  if (artistError || groupError) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div>Failed to load data</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white pb-10 select-none">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <h1 className="text-3xl font-bold">dee<span className='text-green-500'>&apos;</span>tz</h1>
        <button className="rounded-full" onClick={() => {router.push("/main/search")}}>
          <Search className='size-8'/>
        </button>
      </header>

      <main className="space-y-8">
        {/* Banner Section - Full width on mobile, constrained on desktop */}
        {/* <section className="w-full">
          <div className="md:px-6 lg:px-8 px-6">
            <SlidingBanner
              items={bannerItems}
              autoplay={true}
              autoplayDelay={4000}
              showControls={false}
              showPagination={true}
              aspectRatio="banner"
              className="w-full"
              effect="slide"
              loop={true}
            />
          </div>
        </section> */}

        {/* Hero Section */}
        <section className="space-y-4 px-6">
          <h2 className="text-4xl font-normal">
            Discover<br />
            Our <span className="font-bold">Artists</span>
          </h2>
        </section>

        {/* Popular Artists Section */}
        <section className="space-y-4 px-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-normal">Popular Artists</h3>
            <Link
              href="/main/search"
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:flex gap-4">
            {
              artistLoading ?
              Array(4).fill(0).map((_, index) => (
                <div key={index} className='w-full bg-gray-950 animate-pulse aspect-3/4 rounded-lg'></div>
              ))
            :
            artists.map((artist) => (
              <ArtistCard
                key={artist.artist_id}
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
                className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-5 h-5" />
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