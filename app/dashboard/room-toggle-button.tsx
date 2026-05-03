'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { DoorClosed, DoorOpen, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { toggleRoomStateAction } from '@/actions/member/toggle-room-state'
import { cn } from '@/lib/utils'

export function RoomToggleButton({ isOpen }: { isOpen: boolean }) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <button
      type='button'
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const r = await toggleRoomStateAction()
          if (r.ok) {
            toast.success(r.isOpen ? 'Sala aberta!' : 'Sala fechada!')
            router.refresh()
          } else {
            toast.error(r.error)
          }
        })
      }}
      className={cn(
        'group border-border/50 from-card/90 relative w-full overflow-hidden rounded-2xl border bg-gradient-to-br to-muted/20 text-left shadow-lg ring-1 ring-white/5 transition-all',
        'hover:border-border hover:shadow-xl hover:ring-white/10',
        'focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none',
        'disabled:pointer-events-none disabled:opacity-60',
        'active:scale-[0.99]',
      )}
    >
      <div
        className={cn(
          'absolute inset-0 opacity-40 transition-opacity group-hover:opacity-55',
          isOpen
            ? 'bg-[radial-gradient(ellipse_80%_120%_at_100%_0%,oklch(0.55_0.15_160/0.25),transparent_55%)]'
            : 'bg-[radial-gradient(ellipse_80%_120%_at_0%_100%,oklch(0.55_0.14_85/0.2),transparent_55%)]',
        )}
      />
      <div className='relative flex items-center gap-4 px-4 py-3.5 sm:px-5 sm:py-4'>
        <div
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-xl ring-1 transition-colors',
            isOpen
              ? 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/25'
              : 'bg-amber-500/12 text-amber-400 ring-amber-500/25',
          )}
        >
          {pending ? (
            <Loader2 className='size-5 animate-spin' />
          ) : isOpen ? (
            <DoorOpen className='size-5' strokeWidth={2} />
          ) : (
            <DoorClosed className='size-5' strokeWidth={2} />
          )}
        </div>
        <div className='min-w-0 flex-1'>
          <p className='text-sm font-semibold tracking-tight'>
            {isOpen ? 'Sala Aberta' : 'Sala fechada'}
          </p>
          <p className='text-muted-foreground mt-0.5 text-xs leading-snug'>
            {pending
              ? 'Atualizando status da sala...'
              : isOpen
                ? 'Clique para marcar a sala como "Fechada".'
                : 'Clique para marcar a sala como "Aberta".'}
          </p>
        </div>
        <div
          className={cn(
            'shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-colors',
            isOpen
              ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-500 ring-1 ring-emerald-500/35',
          )}
        >
          {pending ? '…' : isOpen ? 'Fechar' : 'Abrir'}
        </div>
      </div>
    </button>
  )
}
