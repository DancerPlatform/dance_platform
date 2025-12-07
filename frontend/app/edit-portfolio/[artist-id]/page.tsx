'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { ArtistPortfolioEditableClient } from '@/components/ArtistPortfolioEditableClient';
import type { ArtistPortfolio } from '@/components/ArtistPortfolioClient';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';

export default function EditPortfolioPage() {
  const { user, profile, artistUser, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const artistId = params['artist-id'] as string;

  const [portfolio, setPortfolio] = useState<ArtistPortfolio | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);

  // Check edit permissions
  useEffect(() => {
    const checkPermission = async () => {
      if (!user || !profile) {
        setPermissionChecked(true);
        setIsLoading(false);
        return;
      }

      try {
        // Check if the current user has permission to edit this artist's portfolio
        const { data, error } = await supabase
          .from('edit_permissions')
          .select('artist_id')
          .eq('auth_id', user.id)
          .eq('artist_id', artistId)
          .single();

        if (error) {
          console.error('Permission check error:', error);
          setHasPermission(false);
        } else {
          setHasPermission(!!data);
        }
      } catch (error) {
        console.error('Failed to check permissions:', error);
        setHasPermission(false);
      } finally {
        setPermissionChecked(true);
      }
    };

    if (!loading) {
      checkPermission();
    }
  }, [user, profile, artistId, loading]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!hasPermission || !permissionChecked) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/artists/${artistId}`,
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

    if (permissionChecked) {
      fetchPortfolio();
    }
  }, [artistId, hasPermission, permissionChecked]);

  // Show loading state
  if (loading || !permissionChecked || isLoading) {
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

  // Check if user has permission to edit this portfolio
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
          <p className="text-zinc-400 mb-8">
            이 포트폴리오를 수정할 권한이 없습니다.
          </p>
          <button
            onClick={() => router.push('/main/profile')}
            className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors"
          >
            프로필로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p className="text-zinc-400">포트폴리오를 불러올 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header onBack={() => {router.push('/main/profile')}} />
      <ArtistPortfolioEditableClient portfolio={portfolio} artistId={artistId} />
      <Footer />
    </div>
  );
}
