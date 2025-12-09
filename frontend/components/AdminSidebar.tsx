'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload, FileCheck, LayoutDashboard, Users, X, UsersRound } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: '대시보드',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: '아티스트 관리',
    href: '/admin/artists',
    icon: Users,
  },
  {
    name: '팀 관리',
    href: '/admin/teams',
    icon: UsersRound,
  },
  {
    name: '데이터 업로드',
    href: '/admin/bulk-upload',
    icon: Upload,
  },
  {
    name: '소유권 이전 신청',
    href: '/admin/claims',
    icon: FileCheck,
  },
]

interface AdminSidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function AdminSidebar({ isOpen = true, onClose }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex h-full w-64 flex-col bg-zinc-900 border-r border-zinc-800 transition-transform duration-300 ease-in-out",
        "lg:translate-x-0 lg:static lg:z-auto",
        "fixed inset-y-0 left-0 z-50",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-zinc-800">
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-green-600 text-white'
                    : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
