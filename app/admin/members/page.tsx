import { redirect } from 'next/navigation'

import { listMembersAction } from '@/actions/admin/members/list-members'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSession } from '@/lib/auth/session'

import { MembersAdminClient } from './members-admin-client'

export default async function AdminMembersPage() {
  const { member } = await getSession()
  if (!member || member.role !== 'admin') {
    redirect('/login')
  }

  const members = await listMembersAction()

  return (
    <div className='space-y-6'>
      <Card className='border-0 bg-transparent py-0 shadow-none ring-0'>
        <CardHeader className='px-0 pt-0'>
          <CardTitle className='text-2xl'>Members</CardTitle>
          <CardDescription>
            Manage organization accounts. The assistant role is limited to one
            person.
          </CardDescription>
        </CardHeader>
      </Card>
      <MembersAdminClient members={members} currentUserId={member.id} />
    </div>
  )
}
