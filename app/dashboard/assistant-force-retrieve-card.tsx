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
  currentHolderRole,
}: {
  currentHolderName: string | null
  currentHolderRole: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)

  const translatedRole =
    currentHolderRole === 'admin'
      ? 'Admin'
      : currentHolderRole === 'member'
        ? 'Membro'
        : currentHolderRole === 'assistant'
          ? 'Secretaria'
          : null

  const roleSuffix = translatedRole ? ` (${translatedRole})` : ''
  const holderLabel = currentHolderName?.trim()
    ? `${currentHolderName.trim()}${roleSuffix}`
    : 'um membro'

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Registrar devolução da chave</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          A chave está em posse de {holderLabel}
        </p>
      </div>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
          <Button className='w-full' variant='secondary' type='button'>
            Chave devolvida
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Registrar devolução da chave?</AlertDialogTitle>
            <AlertDialogDescription>
              A posse da chave será transferida para você e isso será registrado no histórico de posse de chaves.
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
                  const r = await forceRetrieveKeyAction()
                  setPending(false)
                  if (r.ok) {
                    toast.success('Chave devolvida. Histórico atualizado.')
                    setOpen(false)
                    router.refresh()
                  } else {
                    toast.error(r.error)
                  }
                }}
              >
                Sim, registrar devolução
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
