'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { requestKeyFromHolderAction } from '@/actions/member/request-key-from-holder'
import { Button } from '@/components/ui/button'

export function RequestKeyFromHolderButton({
  canRequest,
  pending,
  holderName,
}: {
  canRequest: boolean
  pending: boolean
  holderName: string
}) {
  const router = useRouter()

  const enabled = canRequest && !pending
  const label = pending ? 'Requisição pendente' : `Requisitar chave de ${holderName}`

  return (
    <Button
      className='w-full shadow-lg'
      size='lg'
      type='button'
      disabled={!enabled}
      onClick={
        enabled
          ? async () => {
              const r = await requestKeyFromHolderAction('')
              if (r.ok) {
                toast.success('Requisição enviada.')
                router.refresh()
              } else {
                toast.error(r.error)
              }
            }
          : undefined
      }
    >
      {label}
    </Button>
  )
}
