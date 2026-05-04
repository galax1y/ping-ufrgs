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
        <p className='text-sm font-medium text-amber-500 '>Ação de admin</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          Restaurar a chave para a posse da secreatria. Requisições pendentes serão rejeitadas.
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className='w-full bg-primary' variant='default' type='button'>
            Restaurar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restaurar posse da chave?</AlertDialogTitle>
            <AlertDialogDescription>
              Restaurar a chave para a posse da secreatria. Requisições pendentes serão rejeitadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Cancelar</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button
                variant='ghost'
                disabled={pending}
                type='button'
                onClick={async (e) => {
                  e.preventDefault()
                  setPending(true)
                  const r = await resetKeyToVaultAction()
                  setPending(false)
                  if (r.ok) {
                    toast.success('Chave restaurada.')
                    setOpen(false)
                    router.refresh()
                  } else {
                    toast.error(r.error)
                  }
                }}
              >
                Restaurar chave
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
