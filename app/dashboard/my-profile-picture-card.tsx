'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import { updateMyProfilePictureAction } from '@/actions/member/update-my-profile-picture'
import { ProfilePictureField } from '@/components/profile-picture-field'
import { Button } from '@/components/ui/button'

export function MyProfilePictureCard({
  memberId,
  name,
  photoVersion,
}: {
  memberId: string
  name: string
  photoVersion: number | null
}) {
  const router = useRouter()

  return (
    <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
      <div className='space-y-1'>
        <p className='text-sm font-medium'>Sua foto de perfil</p>
        <p className='text-muted-foreground text-xs text-pretty'>
          Quem aprova sua requisição de chave verá esta foto.
        </p>
      </div>
      <form
        className='space-y-3'
        action={async (fd) => {
          const r = await updateMyProfilePictureAction(fd)
          if (r.ok) {
            toast.success('Foto atualizada.')
            router.refresh()
          } else {
            toast.error(r.error)
          }
        }}
      >
        <ProfilePictureField
          memberId={memberId}
          memberName={name}
          photoVersion={photoVersion}
          showClear
        />
        <Button type='submit' size='sm' variant='secondary'>
          Salvar foto
        </Button>
      </form>
    </div>
  )
}
