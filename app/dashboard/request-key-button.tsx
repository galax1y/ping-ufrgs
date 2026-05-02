'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { requestKeyAction } from '@/actions/member/request-key'
import { Button } from '@/components/ui/button'

export function RequestKeyButton({
  canRequest,
  pending,
}: {
  canRequest: boolean
  pending: boolean
}) {
  const router = useRouter()

  const enabled = canRequest && !pending
  const label = pending ? 'Request pending' : 'Request key'

  return (
    <Button
      className='w-full shadow-lg'
      size='lg'
      type='button'
      disabled={!enabled}
      onClick={
        enabled
          ? async () => {
              const r = await requestKeyAction('')
              if (r.ok) {
                toast.success('Request sent.')
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
