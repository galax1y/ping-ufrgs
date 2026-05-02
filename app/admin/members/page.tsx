import { redirect } from 'next/navigation'

import { listMembersAction } from '@/actions/admin/members/list-members'
import { getSession } from '@/lib/auth/session'

import { MembersAdminClient } from './members-admin-client'

export default async function AdminMembersPage() {
  const { member } = await getSession()
  if (!member || member.role !== 'admin') {
    redirect('/login')
  }

  const members = await listMembersAction()

  return <MembersAdminClient members={members} currentUserId={member.id} />
}
