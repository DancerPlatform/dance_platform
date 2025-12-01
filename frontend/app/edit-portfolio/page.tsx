'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { ArtistPortfolioEditableClient } from '@/components/ArtistPortfolioEditableClient';
import type { ArtistPortfolio } from '@/components/ArtistPortfolioClient';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';

export default function EditPortfolioPage() {
  const { user, profile, artistUser, loading } = useAuth();
  const router = useRouter();
  const [portfolio, setPortfolio] = useState<ArtistPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!user || !profile || profile.user_type !== 'artist' || !artistUser) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistUser.artist_id}`,
          {
            cache: 'no-store',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPortfolio(data);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!loading) {
      fetchPortfolio();
    }
  }, [user, profile, artistUser, loading]);

  // Show loading state
  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!user || !profile) {
    router.push('/login');
    return null;
  }

  // Check if user is an artist
  if (profile.user_type !== 'artist') {
    router.push('/main/profile');
    return null;
  }

  if (!portfolio || !artistUser) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">포트폴리오를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <ArtistPortfolioEditableClient portfolio={portfolio} artistId={artistUser.artist_id} />
      <Footer />
    </div>
  );
}
