'use client';

import { X, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SideMenu({ isOpen, onClose }: SideMenuProps) {
  const router = useRouter();

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleProfileClick = () => {
    router.push('/main/profile');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Side Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-zinc-900 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-zinc-800">
            <h2 className="text-xl font-bold">dancers<span className='text-green-500'>.</span>bio</h2>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 transition-colors duration-200"
              aria-label="Close menu"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-4 p-4 hover:bg-zinc-700 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                    <User className="w-5 h-5 text-green-500" />
                  </div>
                  <span className="text-lg font-medium">My Profile</span>
                </button>
              </li>
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-zinc-800">
            <p className="text-sm text-zinc-500 text-center">
              dancers<span className="text-green-500">.</span>bio
            </p>
          </div>
        </div>
      </div>
    </>
  );
}