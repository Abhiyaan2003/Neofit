'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Dumbbell, BarChart3, User, BookOpen } from 'lucide-react'

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Home',     icon: Home },
  { href: '/workouts',  label: 'Workouts', icon: Dumbbell },
  { href: '/programs',  label: 'Programs', icon: BookOpen },
  { href: '/progress',  label: 'Progress', icon: BarChart3 },
  { href: '/profile',   label: 'Profile',  icon: User },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Hide bottom nav during active workout session
  const hideNav = pathname.startsWith('/workout/')

  return (
    <div className="min-h-screen bg-[#0F1115] flex flex-col">
      <main className={`flex-1 ${!hideNav ? 'pb-24' : ''}`}>
        {children}
      </main>

      {!hideNav && (
        <nav
          className="fixed bottom-0 left-0 right-0 z-40"
          style={{ paddingBottom: 'max(12px, env(safe-area-inset-bottom))' }}
        >
          {/* Blur backdrop */}
          <div className="absolute inset-0 bg-[#0F1115]/85 backdrop-blur-xl border-t border-white/5" />

          <div className="relative flex items-center justify-around px-2 pt-2">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-200 ${
                    isActive ? 'text-[#8BAE9E]' : 'text-[#A8B0BE]/60 hover:text-[#A8B0BE]'
                  }`}
                >
                  <div className="relative">
                    <Icon className="w-5 h-5" strokeWidth={isActive ? 2 : 1.5} />
                    {isActive && (
                      <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#8BAE9E]" />
                    )}
                  </div>
                  <span className={`text-[10px] font-medium transition-all ${isActive ? 'text-[#8BAE9E]' : ''}`}>
                    {label}
                  </span>
                </Link>
              )
            })}
          </div>
        </nav>
      )}
    </div>
  )
}
