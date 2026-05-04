import { redirect } from 'next/navigation'

import { listMembersAction } from '@/actions/admin/members/list-members'
import { getSession } from '@/lib/auth/session'

import { MembersAdminClient } from './members-admin-client'
import { AdminResetKeyCard } from './admin-reset-key-card'
import { Span } from 'next/dist/trace'
import { Separator } from '@/components/ui/separator'

export default async function AdminMembersPage() {
  const { member } = await getSession()
  if (!member || member.role !== 'admin') {
    redirect('/login')
  }

  const members = await listMembersAction()

  return <>
    {member.role === 'admin' ? <AdminResetKeyCard /> : null}
    <Separator className='my-4' />
    <MembersAdminClient members={members} currentUserId={member.id} />
  </>
}
