'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { resetKeyToVaultAction } from '@/actions/admin/reset-key-to-vault'
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

export function AdminResetKeyCard() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border border-amber-500/25 p-4 shadow-sm'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Admin · Key custody</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          Return the key to assistant possession (vault). Pending key requests
          are cancelled. This is logged.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className='w-full' variant='outline' type='button'>
            Reset key to vault
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset key to vault?</AlertDialogTitle>
            <AlertDialogDescription>
              The key will leave whoever holds it and go back to assistant
              custody. All pending requests will be cancelled. The action is
              recorded in the ownership log.
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
                  const r = await resetKeyToVaultAction()
                  setPending(false)
                  if (r.ok) {
                    toast.success('Key returned to vault.')
                    setOpen(false)
                    router.refresh()
                  } else {
                    toast.error(r.error)
                  }
                }}
              >
                Reset key
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
