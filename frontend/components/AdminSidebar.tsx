'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Upload, FileCheck, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Bulk Upload',
    href: '/admin/bulk-upload',
    icon: Upload,
  },
  {
    name: 'Claims',
    href: '/admin/claims',
    icon: FileCheck,
  },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-zinc-900 border-r border-zinc-800">
      <div className="flex h-16 items-center px-6 border-b border-zinc-800">
        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
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
  )
}
