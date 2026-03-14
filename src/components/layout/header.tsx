'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Shield, LayoutDashboard, Plus } from 'lucide-react'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/releases/new', label: 'New Release', icon: Plus },
]

export function Header() {
  const pathname = usePathname()

  return (
    <header className='sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-md'>
      <div className='mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8'>
        <Link
          href='/'
          className='flex items-center gap-2 font-semibold text-gray-900 transition-colors hover:text-indigo-600 focus-ring rounded-md px-1'
        >
          <Shield className='h-5 w-5 text-indigo-600' />
          <span className='text-lg tracking-tight'>FaultMint</span>
        </Link>

        <nav className='flex items-center gap-1' aria-label='Main navigation'>
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href || pathname.startsWith(link.href + '/')
            const Icon = link.icon

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-ring',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                )}
              >
                <Icon className='h-4 w-4' />
                <span className='hidden sm:inline'>{link.label}</span>
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
