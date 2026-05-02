import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }

  return (
    <div className='from-background via-background to-muted/30 flex flex-1 flex-col bg-gradient-to-b'>
      <div className='mx-auto w-full max-w-lg flex-1 px-4 pt-6 pb-4'>
        {children}
      </div>
    </div>
  )
}
