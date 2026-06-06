import { memberInitials } from '@/lib/profile-picture'
import { memberAvatarUrl } from '@/lib/profile-picture-data-url'
import { cn } from '@/lib/utils'

const sizeClasses = {
  sm: 'size-9 text-xs',
  md: 'size-11 text-sm',
  lg: 'size-14 text-base',
} as const

export function MemberAvatar({
  name,
  memberId,
  photoVersion,
  /** Inline data URL (admin preview or local file selection only). */
  profilePicture,
  size = 'md',
  className,
}: {
  name: string
  memberId?: string
  photoVersion?: number | null
  profilePicture?: string | null
  size?: keyof typeof sizeClasses
  className?: string
}) {
  const initials = memberInitials(name)
  const src =
    profilePicture ??
    (memberId ? memberAvatarUrl(memberId, photoVersion ?? null) : null)

  return (
    <span
      className={cn(
        'bg-muted text-muted-foreground ring-border/60 inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-semibold ring-1',
        sizeClasses[size],
        className,
      )}
      aria-hidden
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt='' className='size-full object-cover' />
      ) : (
        initials
      )}
    </span>
  )
}
