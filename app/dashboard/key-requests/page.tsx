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

  const pending = await listPendingKeyRequestsAction()

  return (
    <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
      <div className='flex flex-col gap-4'>
        <div className='space-y-1'>
          <h1 className='text-xl font-semibold tracking-tight'>Requisições de chave</h1>
          <p className='text-muted-foreground text-sm text-pretty'>
            Membros fazem requisições pela posse da chave. Aceitar transfere a posse da chave para ele, enquanto as outras requisições pendentes são canceladas.
          </p>
        </div>
        <AssistantPendingRequests initialRequests={pending} />
      </div>
    </div>
  )
}
