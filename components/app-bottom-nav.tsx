'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { LucideIcon } from 'lucide-react'
import {
  ClipboardList,
  History,
  LayoutGrid,
  LogOut,
  Users,
} from 'lucide-react'

import { logoutAction } from '@/lib/auth/logout-action'
import { FooterThemeToggle } from '@/components/footer-theme-toggle'
import { cn } from '@/lib/utils'

function NavItem({
  href,
  label,
  icon: Icon,
  active,
  badgeCount,
}: {
  href: string
  label: string
  icon: LucideIcon
  active: boolean
  /** Pending notification count (e.g. key requests). */
  badgeCount?: number
}) {
  const showBadge =
    typeof badgeCount === 'number' && badgeCount > 0
  const badgeLabel = badgeCount! > 99 ? '99+' : String(badgeCount)

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
      <span className='relative inline-flex'>
        <Icon className='size-5' strokeWidth={active ? 2.25 : 2} />
        {showBadge ? (
          <span
            className='bg-destructive text-destructive-foreground ring-background absolute -top-1.5 -right-2 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[9px] leading-none font-bold shadow-sm ring-2'
            aria-label={`${badgeCount} pendente${badgeCount === 1 ? '' : 's'}`}
          >
            {badgeLabel}
          </span>
        ) : null}
      </span>
      {label}
    </Link>
  )
}

export function AppBottomNav({
  isAdmin,
  isAssistant,
  pendingKeyRequestCount = 0,
}: {
  isAdmin: boolean
  isAssistant: boolean
  /** Pending key requests (assistants only; shown on Requests tab). */
  pendingKeyRequestCount?: number
}) {
  const pathname = usePathname()
  const onStatus = pathname === '/dashboard'
  const onHistory = pathname.startsWith('/dashboard/history')
  const onRequests = pathname.startsWith('/dashboard/key-requests')
  const onAdmin = pathname.startsWith('/admin')

  const gridCols = isAdmin || isAssistant ? 'grid-cols-5' : 'grid-cols-4'

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
          label='Painel'
          icon={LayoutGrid}
          active={onStatus}
        />
        {isAdmin ? (
          <NavItem
            href='/admin/members'
            label='Membros'
            icon={Users}
            active={onAdmin}
          />
        ) : null}
        {isAssistant ? (
          <NavItem
            href='/dashboard/key-requests'
            label='Requisições'
            icon={ClipboardList}
            active={onRequests}
            badgeCount={pendingKeyRequestCount}
          />
        ) : null}
        <NavItem
          href='/dashboard/history'
          label='Histórico'
          icon={History}
          active={onHistory}
        />
        <FooterThemeToggle />
        <form action={logoutAction} className='flex h-full min-h-0'>
          <button
            type='submit'
            className='text-muted-foreground hover:bg-muted/80 hover:text-foreground flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl py-1 text-[10px] font-medium transition-colors'
          >
            <LogOut className='size-5' />
            Sair
          </button>
        </form>
      </div>
    </nav>
  )
}
