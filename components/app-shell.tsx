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
      <main className='bg-background text-foreground flex min-h-dvh flex-col overflow-y-auto pb-[calc(6.5rem+env(safe-area-inset-bottom))]'>
        {children}
      </main>
      <AppBottomNav
        memberName={member.name}
        isAdmin={member.role === 'admin'}
        isAssistant={member.role === 'assistant'}
        pendingKeyRequestCount={pendingKeyRequestCount}
      />
    </>
  )
}
