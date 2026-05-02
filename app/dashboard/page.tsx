import { redirect } from 'next/navigation'
import { DoorOpen, KeyRound } from 'lucide-react'

import { getDashboardState } from '@/actions/member/get-dashboard-state'
import { type SemanticStatusTone, semanticStatus } from '@/lib/semantic-status'
import { cn } from '@/lib/utils'

import { AdminResetKeyCard } from './admin-reset-key-card'
import { AssistantForceRetrieveCard } from './assistant-force-retrieve-card'
import { RequestKeyButton } from './request-key-button'

export default async function DashboardPage() {
  let state
  try {
    state = await getDashboardState()
  } catch {
    redirect('/login')
  }

  const {
    room,
    key,
    keyWithAssistant,
    canRequestKey,
    assistantCanForceRetrieve,
    pendingRequestId,
    self,
    selfHoldsKey,
  } = state

  const requestHint = pendingRequestId
    ? 'You already have a pending request.'
    : selfHoldsKey
      ? 'You are holding the key.'
      : !keyWithAssistant
        ? 'The key is not with the assistant right now.'
        : 'The key is with the assistant. You can request it below.'

  const keyHeadline =
    key.holderId == null ? 'Assistant' : (key.holderName ?? 'Unknown')

  const keySub =
    key.holderId != null && key.holderRole
      ? key.holderRole.charAt(0).toUpperCase() + key.holderRole.slice(1)
      : key.holderId == null
        ? 'Vault'
        : null

  const roomTone: SemanticStatusTone = !room
    ? 'destructive'
    : room.isOpen
      ? 'success'
      : 'caution'

  const keyTone: SemanticStatusTone = keyWithAssistant ? 'success' : 'caution'

  const roomS = semanticStatus(roomTone)
  const keyS = semanticStatus(keyTone)

  return (
    <div className='flex flex-col gap-5'>
      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border p-6 shadow-lg',
          roomS.surfaceCard,
        )}
      >
        <div
          className={cn(
            'absolute -top-8 -right-8 size-32 rounded-full blur-2xl',
            roomS.glow,
          )}
        />
        <div className='relative flex flex-col items-center text-center'>
          <div
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-2xl ring-1',
              roomS.iconTile,
            )}
          >
            <DoorOpen className='size-7' />
          </div>
          <p className='text-muted-foreground mb-1 text-[11px] font-medium tracking-[0.2em] uppercase'>
            Room
          </p>
          {room ? (
            <p
              className={cn(
                'text-4xl font-bold tracking-tight sm:text-5xl',
                roomS.emphasis,
              )}
            >
              {room.isOpen ? 'Open' : 'Closed'}
            </p>
          ) : (
            <p className={cn('text-lg font-semibold', roomS.emphasis)}>
              Setup needed
            </p>
          )}
        </div>
      </section>

      <section
        className={cn(
          'relative overflow-hidden rounded-2xl border p-6 shadow-lg',
          keyS.surfaceCard,
        )}
      >
        <div
          className={cn(
            'absolute top-1/2 -left-6 size-24 -translate-y-1/2 rounded-full blur-2xl',
            keyS.glow,
          )}
        />
        <div className='relative flex flex-col items-center text-center'>
          <div
            className={cn(
              'mb-4 flex size-14 items-center justify-center rounded-2xl ring-1',
              keyS.iconTile,
            )}
          >
            <KeyRound className='size-7' />
          </div>
          <p className='text-muted-foreground mb-1 text-[11px] font-medium tracking-[0.2em] uppercase'>
            Key
          </p>
          <p
            className={cn(
              'text-3xl font-semibold tracking-tight sm:text-4xl',
              keyS.titleSoft,
            )}
          >
            {keyHeadline}
          </p>
          {keySub ? (
            <p className={cn('mt-1 text-sm', keyS.subtitleSoft)}>{keySub}</p>
          ) : null}
          {!keyWithAssistant && !selfHoldsKey ? (
            <p className='text-muted-foreground mt-3 max-w-[240px] text-xs'>
              With someone else — request unavailable
            </p>
          ) : null}
        </div>
      </section>

      {self.role === 'admin' ? <AdminResetKeyCard /> : null}

      {self.role === 'assistant' ? (
        <AssistantForceRetrieveCard
          canRetrieve={assistantCanForceRetrieve}
          currentHolderName={key.holderName}
        />
      ) : (
        <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
          <div className='space-y-1'>
            <p className='text-sm font-medium'>Request key from assistant</p>
            <p className='text-muted-foreground text-xs text-pretty'>
              {requestHint}
            </p>
          </div>
          <RequestKeyButton
            canRequest={canRequestKey}
            pending={pendingRequestId != null}
          />
        </div>
      )}
    </div>
  )
}
