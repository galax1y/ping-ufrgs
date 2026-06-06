import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }

  return (
    <div className='from-background via-background to-muted/25 flex min-h-0 flex-1 flex-col bg-gradient-to-b'>
      <div className='container mx-auto w-full max-w-4xl flex-1 px-4 py-6 pb-8'>
        {children}
      </div>
    </div>
  )
}
