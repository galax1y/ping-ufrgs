import type { ReactNode } from 'react'
import { and, count, eq } from 'drizzle-orm'

import { AppBottomNav } from '@/components/app-bottom-nav'
import database from '@/database'
import { keyRequestsInPing } from '@/database/drizzle/schema'
import { getSession } from '@/lib/auth/session'

export async function AppShell({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  const { member } = await getSession()

  if (!member) {
    return (
      <main className='bg-background text-foreground min-h-dvh'>{children}</main>
    )
  }

  let pendingKeyRequestCount = 0
  if (member.role === 'assistant') {
    const [row] = await database
      .select({ n: count() })
      .from(keyRequestsInPing)
      .where(
        and(
          eq(keyRequestsInPing.status, 'pending'),
          eq(keyRequestsInPing.kind, 'assistant'),
        ),
      )
    pendingKeyRequestCount = Number(row?.n ?? 0)
  }

  return (
    <>
      <main className='bg-background text-foreground flex h-dvh min-h-0 flex-col overflow-hidden pb-28'>
        {children}
      </main>
      <AppBottomNav
        isAdmin={member.role === 'admin'}
        isAssistant={member.role === 'assistant'}
        pendingKeyRequestCount={pendingKeyRequestCount}
      />
    </>
  )
}
