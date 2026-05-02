'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, LogOut, Users } from 'lucide-react'

import { logoutAction } from '@/lib/auth/logout-action'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: typeof LayoutGrid
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={cn(
        'flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-medium transition-colors',
        active
          ? 'bg-primary/15 text-primary'
          : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground',
      )}
    >
      <Icon className='size-5' strokeWidth={active ? 2.25 : 2} />
      {label}
    </Link>
  )
}

export function AppBottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const onStatus = pathname === '/dashboard'

  return (
    <nav
      className='border-border/60 bg-background/90 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t shadow-[0_-4px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]'
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'mx-auto grid h-[4.25rem] max-w-lg gap-1 px-2 pt-1',
          isAdmin ? 'grid-cols-4' : 'grid-cols-3',
        )}
      >
        <NavItem
          href='/dashboard'
          label='Status'
          icon={LayoutGrid}
          active={onStatus}
        />
        {isAdmin ? (
          <NavItem
            href='/admin/members'
            label='Members'
            icon={Users}
            active={pathname.startsWith('/admin')}
          />
        ) : null}
        <div className='flex h-full flex-col items-center justify-center gap-0.5'>
          <ThemeToggle />
          <span className='text-muted-foreground text-[10px] font-medium'>
            Theme
          </span>
        </div>
        <form action={logoutAction} className='flex h-full min-h-0'>
          <button
            type='submit'
            className='text-muted-foreground hover:bg-muted/80 hover:text-foreground flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-medium transition-colors'
          >
            <LogOut className='size-5' />
            Out
          </button>
        </form>
      </div>
    </nav>
  )
}
