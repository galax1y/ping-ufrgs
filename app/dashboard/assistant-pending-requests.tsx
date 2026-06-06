'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { acceptKeyRequestAction } from '@/actions/assistant/accept-key-request'
import type { PendingKeyRequestRow } from '@/actions/assistant/list-pending-key-requests'
import { MemberAvatar } from '@/components/member-avatar'
import { Button } from '@/components/ui/button'
import { keyRequestIntro } from '@/lib/key-request-copy'

export function AssistantPendingRequests({
  initialRequests,
}: {
  initialRequests: PendingKeyRequestRow[]
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  if (initialRequests.length === 0) {
    return (
      <div className='border-border/50 bg-card/60 rounded-2xl border p-4 shadow-sm'>
        <p className='text-muted-foreground text-sm'>Sem requisições pendentes.</p>
      </div>
    )
  }

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <p className='text-muted-foreground text-xs text-pretty'>
        {keyRequestIntro(initialRequests.length)}
      </p>
      <ul className='space-y-3'>
        {initialRequests.map((r) => (
          <li
            key={r.id}
            className='border-border/60 flex flex-col gap-2 rounded-xl border bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='flex min-w-0 flex-1 gap-3'>
              <MemberAvatar
                name={r.requesterName}
                memberId={r.requesterId}
                photoVersion={r.requesterPhotoVersion}
                size='lg'
              />
              <div className='min-w-0'>
                <p className='truncate text-sm font-medium'>{r.requesterName}</p>
              <p className='text-muted-foreground truncate text-xs'>
                {r.requesterEmail}
              </p>
              <p className='text-muted-foreground mt-1 text-[11px]'>
                {new Date(r.createdAt).toLocaleString('pt-BR', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </p>
              {r.reason ? (
                <p className='text-muted-foreground mt-1 text-xs italic'>
                  “{r.reason}”
                </p>
              ) : null}
              </div>
            </div>
            <Button
              className='shrink-0 sm:ml-2'
              disabled={pending}
              size='sm'
              type='button'
              onClick={() => {
                startTransition(async () => {
                  const res = await acceptKeyRequestAction(r.id)
                  if (res.ok) {
                    toast.success('Chave transferida. Histórico atualizado.')
                    router.refresh()
                  } else {
                    toast.error(res.error)
                  }
                })
              }}
            >
              Aceitar
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
