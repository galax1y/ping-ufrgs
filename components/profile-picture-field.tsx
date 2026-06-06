'use client'

import { useEffect, useState } from 'react'

import { MemberAvatar } from '@/components/member-avatar'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { ALLOWED_PROFILE_PICTURE_TYPES, MAX_PROFILE_PICTURE_BYTES } from '@/lib/profile-picture'

export function ProfilePictureField({
  name = 'profilePicture',
  clearName = 'clearProfilePicture',
  memberName,
  memberId,
  photoVersion = null,
  currentPicture = null,
  showClear = false,
}: {
  name?: string
  clearName?: string
  memberName: string
  memberId?: string
  photoVersion?: number | null
  /** Inline data URL for admin edit preview; omit when using cached avatar URL. */
  currentPicture?: string | null
  showClear?: boolean
}) {
  const [preview, setPreview] = useState<string | null>(currentPicture)
  const [cleared, setCleared] = useState(false)

  useEffect(() => {
    setPreview(currentPicture)
    setCleared(false)
  }, [currentPicture])

  const displayPicture = cleared ? null : preview
  const isLocalPreview =
    displayPicture != null && displayPicture.startsWith('data:')
  const hasRemotePhoto =
    !cleared && photoVersion != null && !isLocalPreview

  return (
    <Field>
      <FieldLabel>Foto de perfil (opcional)</FieldLabel>
      <FieldContent className='space-y-3'>
        <div className='flex items-center gap-3'>
          <MemberAvatar
            name={memberName}
            memberId={memberId}
            photoVersion={hasRemotePhoto ? photoVersion : null}
            profilePicture={isLocalPreview ? displayPicture : null}
            size='lg'
          />
          <div className='min-w-0 flex-1 space-y-2'>
            <Input
              name={name}
              type='file'
              accept={ALLOWED_PROFILE_PICTURE_TYPES.join(',')}
              className='text-xs'
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (!file) return
                if (file.size > MAX_PROFILE_PICTURE_BYTES) {
                  e.target.value = ''
                  return
                }
                setCleared(false)
                const reader = new FileReader()
                reader.onload = () => {
                  if (typeof reader.result === 'string') {
                    setPreview(reader.result)
                  }
                }
                reader.readAsDataURL(file)
              }}
            />
            {showClear && (displayPicture || currentPicture || photoVersion) ? (
              <>
                <input
                  type='hidden'
                  name={clearName}
                  value={cleared ? '1' : '0'}
                  readOnly
                />
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setCleared(true)
                    setPreview(null)
                  }}
                >
                  Remover foto
                </Button>
              </>
            ) : null}
          </div>
        </div>
        <FieldDescription>
          JPEG, PNG, WebP ou GIF — até 2 MB. Aparece nas requisições de chave.
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}
