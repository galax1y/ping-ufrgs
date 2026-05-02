import { redirect } from 'next/navigation'

import { getSession } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }
  if (member.role === 'admin') {
    redirect('/admin/members')
  }
  redirect('/dashboard')
}
