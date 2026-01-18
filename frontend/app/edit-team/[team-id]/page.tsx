'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/stores/authStore';
import { useRouter, useParams } from 'next/navigation';
import { TeamPortfolioEditableClient } from '@/components/TeamPortfolioEditableClient';
import type { GroupPortfolio } from '@/components/GroupPortfolioClient';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { supabase } from '@/lib/supabase';

export default function EditTeamPage() {
  const { user, profile, artistUser, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const teamId = params['team-id'] as string;

  const [portfolio, setPortfolio] = useState<GroupPortfolio | null>(null);
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
        // Admin users have permission to edit all portfolios
        if (profile.is_admin) {
          setHasPermission(true);
          setPermissionChecked(true);
          return;
        }

        // Check if user is a leader or subleader of this team
        const { data: teamData, error: teamError } = await supabase
          .from('team_portfolio')
          .select('leader_id, subleader_id')
          .eq('team_id', teamId)
          .single();

        if (teamError) {
          console.error('Team fetch error:', teamError);
          setHasPermission(false);
        } else if (teamData && artistUser) {
          // Check if user is leader or subleader
          if (
            teamData.leader_id === artistUser.artist_id ||
            teamData.subleader_id === artistUser.artist_id
          ) {
            setHasPermission(true);
          } else {
            setHasPermission(false);
          }
        } else {
          setHasPermission(false);
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
  }, [user, profile, artistUser, teamId, loading]);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      if (!hasPermission || !permissionChecked) {
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/groups/${teamId}`,
          {
            cache: 'no-store',
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPortfolio(data);
        }

        if (!user || !profile) {
          router.push('/login');
          return null;
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
  }, [teamId, hasPermission, permissionChecked]);

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

  // Check if user has permission to edit this portfolio
  if (!hasPermission) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center px-6">
          <h1 className="text-2xl font-bold mb-4">접근 권한이 없습니다</h1>
          <p className="text-zinc-400 mb-8">
            이 팀 포트폴리오를 수정할 권한이 없습니다. 리더 또는 서브리더만 수정할 수 있습니다.
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
      <TeamPortfolioEditableClient portfolio={portfolio} teamId={teamId} />
      {/* <Footer /> */}
    </div>
  );
}
