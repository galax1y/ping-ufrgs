'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import { ClipboardList, LayoutGrid, LogOut, Users } from 'lucide-react'

import { logoutAction } from '@/lib/auth/logout-action'
import { FooterThemeToggle } from '@/components/footer-theme-toggle'
import { cn } from '@/lib/utils'

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string
  label: string
  icon: LucideIcon
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

export function AppBottomNav({
  isAdmin,
  isAssistant,
}: {
  isAdmin: boolean
  isAssistant: boolean
}) {
  const pathname = usePathname()
  const onStatus = pathname === '/dashboard'
  const onRequests = pathname.startsWith('/dashboard/key-requests')
  const onAdmin = pathname.startsWith('/admin')

  const showSecondary = isAdmin || isAssistant
  const gridCols = showSecondary ? 'grid-cols-4' : 'grid-cols-3'

  return (
    <nav
      className='border-border/60 bg-background/90 supports-backdrop-filter:bg-background/80 fixed inset-x-0 bottom-0 z-50 border-t shadow-[0_-4px_24px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:shadow-[0_-4px_24px_rgba(0,0,0,0.35)]'
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
    >
      <div
        className={cn(
          'mx-auto grid h-[4.25rem] max-w-lg gap-1 px-2 pt-1',
          gridCols,
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
            active={onAdmin}
          />
        ) : null}
        {isAssistant ? (
          <NavItem
            href='/dashboard/key-requests'
            label='Requests'
            icon={ClipboardList}
            active={onRequests}
          />
        ) : null}
        <FooterThemeToggle />
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
