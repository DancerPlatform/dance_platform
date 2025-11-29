'use client';

import { Home, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function BottomNav() {
  const pathname = usePathname();
  const isProfileActive = pathname === '/main/profile';

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="relative flex items-center gap-2 bg-zinc-800/90 backdrop-blur-lg rounded-full p-2 shadow-lg transition-all">
        {/* Sliding background indicator */}
        <div
          className="absolute w-16 h-12 bg-zinc-600 rounded-full transition-all duration-300 ease-out"
          style={{
            transform: `translateX(${isProfileActive ? 'calc(4rem + 0.5rem)' : '0'})`,
            willChange: 'transform',
          }}
        />

        <Link
          href="/main"
          prefetch={true}
          className={`relative flex items-center justify-center w-16 h-12 rounded-full transition-all duration-300 ease-out z-10 ${
            pathname === '/main'
              ? 'text-white scale-105'
              : 'text-zinc-400 hover:text-white hover:scale-105'
          }`}
        >
          <Home className="w-6 h-6 transition-transform duration-300 ease-out" />
        </Link>
        <Link
          href="/main/profile"
          prefetch={true}
          className={`relative flex items-center justify-center w-16 h-12 rounded-full transition-all duration-300 ease-out z-10 ${
            pathname === '/main/profile'
              ? 'text-white scale-105'
              : 'text-zinc-400 hover:text-white hover:scale-105'
          }`}
        >
          <User className="w-6 h-6 transition-transform duration-300 ease-out" />
        </Link>
      </div>
    </nav>
  );
}
