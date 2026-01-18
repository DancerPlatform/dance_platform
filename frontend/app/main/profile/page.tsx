'use client';

import { useState, useEffect } from 'react';
import { User, Edit3, Shield, Briefcase, Users, UserPlus, Crown, LogOut } from 'lucide-react';
import { useAuth } from '@/stores/authStore';
import Link from 'next/link';
import Image from 'next/image';
import { PermissionsModal } from '@/components/portfolio/PermissionsModal';
import { ManagedPortfoliosModal } from '@/components/portfolio/ManagedPortfoliosModal';
import { CreateTeamModal } from '@/components/CreateTeamModal';
import { MyTeamsModal } from '@/components/MyTeamsModal';
import MyClaimsClient from '@/components/MyClaimsClient';
import { PortfolioSetupClient } from '@/components/PortfolioSetupClient';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/header';

export default function ProfilePage() {
  const { user, profile, artistUser, signOut, loading, refreshUser } = useAuth();
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isManagedPortfoliosModalOpen, setIsManagedPortfoliosModalOpen] = useState(false);
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isMyTeamsModalOpen, setIsMyTeamsModalOpen] = useState(false);
  const [hasPendingClaims, setHasPendingClaims] = useState(false);
  const [checkingClaims, setCheckingClaims] = useState(true);


  useEffect(() => {
    refreshUser();
  },[])

  // Check for pending claims
  useEffect(() => {
    const checkPendingClaims = async () => {
      if (!user) {
        setCheckingClaims(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || profile?.is_admin) {
          setCheckingClaims(false);
          return;
        }

        const response = await fetch('/api/claims?status=pending', {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setHasPendingClaims(data.claims && data.claims.length > 0);
        }
      } catch (error) {
        console.error('Error checking pending claims:', error);
      } finally {
        setCheckingClaims(false);
      }
    };

    checkPendingClaims();
  }, [user, profile]);

  // Show loading state
  if (loading || checkingClaims) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
  }

  // If user has pending claims, show MyClaimsClient
  if (hasPendingClaims) {
    return <MyClaimsClient />;
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
          <p className="text-zinc-400 mb-8">
            마이페이지를 이용하려면 로그인이 필요합니다.
          </p>
          <Link
            href="/login/artist"
            className="inline-block bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors"
          >
            로그인하기
          </Link>
        </div>
      </div>
    );
  }

  // If user doesn't have artist profile, show portfolio setup
  // if (user) {
  //   return <PortfolioSetupClient />;
  // }

  // Show artist profile
  if (profile.user_type === 'artist' && artistUser) {
    return (
      <div className="min-h-screen bg-black text-white pb-32 pt-10">
        <Header />
        {/* Header */}
        <div className="px-6 pt-6 pb-8">
          <h1 className="text-2xl font-bold">마이페이지</h1>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center pt-8">
          {/* Profile Image */}
          <div className="size-26 rounded-full bg-zinc-400 flex items-center justify-center mb-2 overflow-hidden">
            {artistUser.portfolio_photo ? (
              <Image
                src={artistUser.portfolio_photo}
                alt={artistUser.name}
                width={120}
                height={120}
                className="size-full object-cover object-top"
              />
            ) : (
              <User className="size-16 text-zinc-300" strokeWidth={1.5} />
            )}
          </div>

          {/* Username */}
          <div className='text-center mb-4'>
            <h2 className="text-2xl font-medium">{artistUser.name}</h2>
            <p className="text-zinc-400">{artistUser.email}</p>
          </div>

          {/* Artist Info */}
          <div className="w-full px-6 space-y-2">
            {artistUser.phone && (
              <div className="flex justify-between">
                <span className="text-zinc-400">연락처</span>
                <span>{artistUser.phone}</span>
              </div>
            )}
            {artistUser.birth && (
              <div className="flex justify-between">
                <span className="text-zinc-400">생년월일</span>
                <span>{artistUser.birth}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-zinc-400">회원 유형</span>
              <span className="text-blue-400">아티스트</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-4">
          {/* Edit Portfolio Button */}
          <Link
            href={`/edit-portfolio/${artistUser.artist_id}`}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-t border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <Edit3 className="size-5 text-zinc-400" />
            <span>내 포트폴리오 수정하기</span>
          </Link>

          {/* Add users that are allowed to edit my portfolio */}
          <button
            onClick={() => setIsPermissionsModalOpen(true)}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <Shield className="size-5 text-zinc-400" />
            <span>포트폴리오 권한 설정</span>
          </button>

          {/* View managed portfolios */}
          <button
            onClick={() => setIsManagedPortfoliosModalOpen(true)}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <Briefcase className="size-5 text-zinc-400" />
            <span>관리중인 포트폴리오 보기</span>
          </button>

          {/* My Teams */}
          <button
            onClick={() => setIsMyTeamsModalOpen(true)}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <Users className="size-5 text-zinc-400" />
            <span>내 팀 관리하기</span>
          </button>

          {/* Create Team */}
          <button
            onClick={() => setIsCreateTeamModalOpen(true)}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            <UserPlus className="size-5 text-zinc-400" />
            <span>팀 생성하기</span>
          </button>

          {/* Permissions Modal */}
          <PermissionsModal
            isOpen={isPermissionsModalOpen}
            onClose={() => setIsPermissionsModalOpen(false)}
            artistId={artistUser.artist_id}
          />

          {/* Managed Portfolios Modal */}
          <ManagedPortfoliosModal
            isOpen={isManagedPortfoliosModalOpen}
            onClose={() => setIsManagedPortfoliosModalOpen(false)}
          />

          {/* My Teams Modal */}
          <MyTeamsModal
            isOpen={isMyTeamsModalOpen}
            onClose={() => setIsMyTeamsModalOpen(false)}
          />

          {/* Create Team Modal */}
          <CreateTeamModal
            isOpen={isCreateTeamModalOpen}
            onClose={() => setIsCreateTeamModalOpen(false)}
          />

          {/* Admin Button - Only show if user is admin */}
          {profile.is_admin && (
            <Link
              href="/admin"
              className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg border-b border-zinc-800 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-colors"
            >
              <Crown className="size-5" />
              <span>관리자 페이지</span>
            </Link>
          )}

          {/* Logout Button */}
          <button
            onClick={()=> {
              signOut()
          }}
            className="flex items-center gap-3 w-full px-6 py-4 text-left text-md md:text-lg text-red-500 hover:bg-zinc-900 transition-colors"
          >
            <LogOut className="size-5" />
            <span>로그아웃</span>
          </button>
        </div>
      </div>
    );
  }

  // For non-artist users, show a message
  return <PortfolioSetupClient />;
}
