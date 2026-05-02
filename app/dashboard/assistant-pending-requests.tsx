'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { toast } from 'sonner'

import { acceptKeyRequestAction } from '@/actions/assistant/accept-key-request'
import type { PendingKeyRequestRow } from '@/actions/assistant/list-pending-key-requests'
import { Button } from '@/components/ui/button'

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
        <p className='text-muted-foreground text-sm'>No pending requests.</p>
      </div>
    )
  }

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <p className='text-muted-foreground text-xs text-pretty'>
        Accepting transfers the key and records it in the log. Other pending
        requests are cancelled.
      </p>
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
              disabled={pending}
              size='sm'
              type='button'
              onClick={() => {
                startTransition(async () => {
                  const res = await acceptKeyRequestAction(r.id)
                  if (res.ok) {
                    toast.success('Key transferred. Log updated.')
                    router.refresh()
                  } else {
                    toast.error(res.error)
                  }
                })
              }}
            >
              Accept
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
