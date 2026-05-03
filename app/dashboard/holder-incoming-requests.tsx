'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { acceptKeyRequestFromHolderAction } from '@/actions/member/accept-key-request-from-holder'
import type { IncomingHolderKeyRequestRow } from '@/actions/member/get-dashboard-state'
import { Button } from '@/components/ui/button'

export function HolderIncomingRequests({
  initialRequests,
}: {
  initialRequests: IncomingHolderKeyRequestRow[]
}) {
  const router = useRouter()
  const [busy, startTransition] = useTransition()

  if (initialRequests.length === 0) {
    return null
  }

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Requisições de chave</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          Membros fazem requisições pela posse da chave. Aceitar transfere a posse da chave para ele, enquanto as outras requisições pendentes são canceladas.
        </p>
      </div>
      <ul className='space-y-3'>
        {initialRequests.map((r) => (
          <li
            key={r.id}
            className='border-border/60 flex flex-col gap-2 rounded-xl border bg-background/40 p-3 sm:flex-row sm:items-center sm:justify-between'
          >
            <div className='min-w-0'>
              <p className='truncate text-sm font-medium'>{r.requesterName}</p>
              <p className='text-muted-foreground truncate text-xs'>
                {r.requesterEmail}
              </p>
              <p className='text-muted-foreground mt-1 text-[11px]'>
                {new Date(r.createdAt).toLocaleString(undefined, {
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
            <Button
              className='shrink-0 sm:ml-2'
              disabled={busy}
              size='sm'
              type='button'
              onClick={() => {
                startTransition(async () => {
                  const res = await acceptKeyRequestFromHolderAction(r.id)
                  if (res.ok) {
                    toast.success('Key transferred. Log updated.')
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
