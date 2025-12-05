'use client';

import { useState } from 'react';
import { User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { PermissionsModal } from '@/components/portfolio/PermissionsModal';
import { ManagedPortfoliosModal } from '@/components/portfolio/ManagedPortfoliosModal';

export default function ProfilePage() {
  const { user, profile, artistUser, signOut, loading } = useAuth();
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isManagedPortfoliosModalOpen, setIsManagedPortfoliosModalOpen] = useState(false);


  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-zinc-400">로딩 중...</p>
        </div>
      </div>
    );
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

  // Show artist profile
  if (profile.user_type === 'artist' && artistUser) {
    return (
      <div className="min-h-screen bg-black text-white pb-32">
        {/* Header */}
        <div className="px-6 pt-6 pb-8">
          <h1 className="text-2xl font-bold">마이페이지</h1>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center pt-8">
          {/* Profile Image */}
          <div className="size-30 rounded-full bg-zinc-400 flex items-center justify-center mb-6 overflow-hidden">
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
          <h2 className="text-2xl font-medium mb-2">{artistUser.name}</h2>
          <p className="text-zinc-400 mb-8">{artistUser.email}</p>

          {/* Artist Info */}
          <div className="w-full px-6 space-y-2">
            {artistUser.phone && (
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">연락처</span>
                <span>{artistUser.phone}</span>
              </div>
            )}
            {artistUser.birth && (
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">생년월일</span>
                <span>{artistUser.birth}</span>
              </div>
            )}
            <div className="flex justify-between py-2">
              <span className="text-zinc-400">회원 유형</span>
              <span className="text-blue-400">아티스트</span>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="mt-8">
          {/* Edit Portfolio Button */}
          <Link
            href={`/edit-portfolio/${artistUser.artist_id}`}
            className="block w-full px-6 py-6 text-left text-lg border-t border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            내 포트폴리오 수정하기
          </Link>

          {/* Add users that are allowed to edit my portfolio */}
          <button
            onClick={() => setIsPermissionsModalOpen(true)}
            className="block w-full px-6 py-6 text-left text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            포트폴리오 권한 설정
          </button>

          {/* View managed portfolios */}
          <button
            onClick={() => setIsManagedPortfoliosModalOpen(true)}
            className="block w-full px-6 py-6 text-left text-lg border-b border-zinc-800 hover:bg-zinc-900 transition-colors"
          >
            관리중인 포트폴리오 보기
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

          {/* Logout Button */}
          <button
            onClick={signOut}
            className="w-full px-6 py-6 text-left text-lg text-red-500 hover:bg-zinc-900 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    );
  }

  // For non-artist users, show a message
  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold">마이페이지</h1>
      </div>

      <div className="text-center px-6 pt-8">
        <p className="text-zinc-400 mb-8">
          이 페이지는 아티스트 전용입니다.
        </p>
        <button
          onClick={signOut}
          className="bg-red-500 text-white px-8 py-3 rounded-full font-medium hover:bg-red-600 transition-colors"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}
