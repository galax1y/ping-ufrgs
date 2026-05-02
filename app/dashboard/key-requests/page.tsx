import { redirect } from 'next/navigation'

import { listPendingKeyRequestsAction } from '@/actions/assistant/list-pending-key-requests'
import { getSession } from '@/lib/auth/session'

import { AssistantPendingRequests } from '../assistant-pending-requests'

export const dynamic = 'force-dynamic'

export default async function KeyRequestsPage() {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }

  if (member.role !== 'assistant') {
    return (
      <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
        <div className='space-y-2'>
          <h1 className='text-xl font-semibold tracking-tight'>Key requests</h1>
          <p className='text-muted-foreground text-sm text-pretty'>
            Only the assistant can view and approve key requests. If you need
            access, ask your administrator.
          </p>
        </div>
      </div>
    )
  }

  const pending = await listPendingKeyRequestsAction()

  return (
    <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
      <div className='flex flex-col gap-4'>
        <div className='space-y-1'>
          <h1 className='text-xl font-semibold tracking-tight'>Key requests</h1>
          <p className='text-muted-foreground text-sm text-pretty'>
            Approve a request to transfer the key from assistant custody. The
            handover is logged and everyone&apos;s dashboard updates.
          </p>
        </div>
        <AssistantPendingRequests initialRequests={pending} />
      </div>
    </div>
  )
}
