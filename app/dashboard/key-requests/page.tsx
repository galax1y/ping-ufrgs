import { redirect } from 'next/navigation'

import { listPendingKeyRequestsAction } from '@/actions/assistant/list-pending-key-requests'
import { getSession } from '@/lib/auth/session'
import { keyRequestIntro } from '@/lib/key-request-copy'

import { AssistantPendingRequests } from '../assistant-pending-requests'

export const dynamic = 'force-dynamic'

export default async function KeyRequestsPage() {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }

  const pending = await listPendingKeyRequestsAction()

  return (
    <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
      <div className='flex flex-col gap-4'>
        <div className='space-y-1'>
          <h1 className='text-xl font-semibold tracking-tight'>Requisições de chave</h1>
          {pending.length > 0 ? (
            <p className='text-muted-foreground text-sm text-pretty'>
              {keyRequestIntro(pending.length)}
            </p>
          ) : null}
        </div>
        <AssistantPendingRequests initialRequests={pending} />
      </div>
    </div>
  )
}
