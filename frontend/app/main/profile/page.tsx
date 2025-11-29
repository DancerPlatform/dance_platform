'use client';

import { User } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-black text-white pb-32">
      {/* Header */}
      <div className="px-6 pt-6 pb-8">
        <h1 className="text-2xl font-bold">마이페이지</h1>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col items-center pt-8">
        {/* Profile Image */}
        <div className="size-30 rounded-full bg-zinc-400 flex items-center justify-center mb-6">
          <User className="size-16 text-zinc-300" strokeWidth={1.5} />
        </div>

        {/* Username */}
        <h2 className="text-2xl font-medium mb-8">레난</h2>
      </div>

      {/* Menu Items */}
      <div className="mt-8">
        {/* Edit Portfolio Button */}
        <button className="w-full px-6 py-6 text-left text-lg border-t border-b border-zinc-800 hover:bg-zinc-900 transition-colors">
          포트폴리오 수정
        </button>

        {/* Logout Button */}
        <button className="w-full px-6 py-6 text-left text-lg text-red-500 hover:bg-zinc-900 transition-colors">
          로그아웃
        </button>
      </div>
    </div>
  );
}
