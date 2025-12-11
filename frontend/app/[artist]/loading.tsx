import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function ArtistLoading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Section Skeleton */}
        <div className="relative mb-8 animate-pulse">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image Skeleton */}
            <div className="w-full md:w-64 aspect-3/4 bg-gray-800 rounded-lg shrink-0" />

            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-8 bg-gray-800 rounded w-48" />
              <div className="h-10 bg-gray-800 rounded w-64" />
              <div className="h-6 bg-gray-800 rounded w-32" />
            </div>
          </div>
        </div>

        {/* Portfolio Section Skeleton */}
        <div className="space-y-8 animate-pulse">
          {/* Section Title */}
          <div className="h-8 bg-gray-800 rounded w-40" />

          {/* Grid Items */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-video bg-gray-800 rounded-lg" />
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
