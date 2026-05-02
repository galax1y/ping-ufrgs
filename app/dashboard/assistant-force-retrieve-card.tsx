'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { forceRetrieveKeyAction } from '@/actions/assistant/force-retrieve-key'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export function AssistantForceRetrieveCard({
  currentHolderName,
}: {
  currentHolderName: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const holderLabel = currentHolderName?.trim() || 'the current holder'

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Retrieve key (assistant)</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          The key is with {holderLabel}. You can take it back without a member
          request. This is logged.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className='w-full' variant='secondary' type='button'>
            Retrieve key from holder
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Retrieve the key?</AlertDialogTitle>
            <AlertDialogDescription>
              The key will be transferred to you immediately and recorded in the
              ownership log. Pending key requests will be cancelled. This is
              meant when you must take the key back from {holderLabel}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant='destructive'
                disabled={pending}
                type='button'
                onClick={async (e) => {
                  e.preventDefault()
                  setPending(true)
                  const r = await forceRetrieveKeyAction()
                  setPending(false)
                  if (r.ok) {
                    toast.success('Key retrieved. Log updated.')
                    setOpen(false)
                    router.refresh()
                  } else {
                    toast.error(r.error)
                  }
                }}
              >
                Yes, retrieve key
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
