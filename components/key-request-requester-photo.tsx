'use client'

import { useState } from 'react'
import { ZoomIn } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog'
import { MemberAvatar } from '@/components/member-avatar'
import { memberAvatarUrl } from '@/lib/profile-picture-data-url'
import { cn } from '@/lib/utils'

type KeyRequestRequesterPhotoProps = {
  requesterId: string
  requesterName: string
  photoVersion: number | null
}

/** Requester photo on key-request rows — tap to expand and confirm identity. */
export function KeyRequestRequesterPhoto({
  requesterId,
  requesterName,
  photoVersion,
}: KeyRequestRequesterPhotoProps) {
  const [open, setOpen] = useState(false)
  const src = memberAvatarUrl(requesterId, photoVersion)
  const hasPhoto = src != null

  if (!hasPhoto) {
    return (
      <div className='flex shrink-0 flex-col items-center gap-1'>
        <MemberAvatar name={requesterName} size='lg' />
        <span className='text-muted-foreground max-w-14 text-center text-[9px] leading-tight'>
          Sem foto
        </span>
      </div>
    )
  }

  return (
    <>
      <button
        type='button'
        className={cn(
          'group relative shrink-0 rounded-full focus-visible:outline-none',
          'focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        )}
        aria-label={`Ampliar foto de ${requesterName}`}
        onClick={() => setOpen(true)}
      >
        <MemberAvatar
          name={requesterName}
          memberId={requesterId}
          photoVersion={photoVersion}
          size='lg'
          className='ring-primary/30 transition group-hover:ring-primary/60'
        />
        <span className='bg-background/90 text-muted-foreground absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full ring-1 ring-border'>
          <ZoomIn className='size-3' />
        </span>
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className='z-[100] gap-3 sm:max-w-md'>
          <DialogTitle className='text-center text-base font-semibold'>
            {requesterName}
          </DialogTitle>
          <p className='text-muted-foreground -mt-1 text-center text-xs'>
            Requisição de chave — confira a identidade
          </p>
          <div className='bg-muted/40 flex justify-center rounded-xl p-2'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`Foto de ${requesterName}`}
              className='max-h-[min(70vh,28rem)] w-full max-w-full rounded-lg object-contain'
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
