import type { ReactNode } from 'react'

import { AppBottomNav } from '@/components/app-bottom-nav'
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

  return (
    <>
      <main className='bg-background text-foreground flex min-h-dvh flex-col pb-28'>
        {children}
      </main>
      <AppBottomNav
        isAdmin={member.role === 'admin'}
        isAssistant={member.role === 'assistant'}
      />
    </>
  )
}
