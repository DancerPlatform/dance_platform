'use client';

import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface HeaderProps {
  onBack?: () => void;
  className?: string;
}

export function Header({ onBack, className }: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent',
        className
      )}
    >
      <div className="flex items-center px-4 py-4">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all duration-200 text-white"
          aria-label="Go back"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
