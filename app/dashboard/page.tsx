import { redirect } from 'next/navigation'
import { DoorOpen, KeyRound } from 'lucide-react'

import { getDashboardState } from '@/actions/member/get-dashboard-state'
import { KeyRequestRequesterPhoto } from '@/components/key-request-requester-photo'
import { type SemanticStatusTone, semanticStatus } from '@/lib/semantic-status'
import { cn } from '@/lib/utils'

import { AssistantForceRetrieveCard } from './assistant-force-retrieve-card'
import { HolderIncomingRequests } from './holder-incoming-requests'
import { MyProfilePictureCard } from './my-profile-picture-card'
import { RequestKeyButton } from './request-key-button'
import { RequestKeyFromHolderButton } from './request-key-from-holder-button'
import { RoomToggleButton } from './room-toggle-button'

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
    canRequestKeyFromHolder,
    incomingHolderRequests,
    assistantCanForceRetrieve,
    pendingRequestId,
    self,
    selfHoldsKey,
  } = state

  const assistantRequestHint = pendingRequestId
    ? 'Você já tem uma requisição pendente.'
    : selfHoldsKey
      ? 'Você está com a chave.'
      : 'A chave está com a secretaria. Você pode requisitá-la abaixo.'

  const holderRequestHint = pendingRequestId
    ? 'Você já tem uma requisição pendente.'
    : selfHoldsKey
      ? 'Você está com a chave.'
      : `Peça a ${key.holderName ?? 'quem tem a chave'} para transferir a chave para você.`

  const keyHeadline =
    key.holderId == null ? 'Secretaria' : (key.holderName ?? 'Desconhecido')


  const roomTone: SemanticStatusTone = !room
    ? 'destructive'
    : room.isOpen
      ? 'success'
      : 'caution'

  const keyTone: SemanticStatusTone = keyWithAssistant ? 'success' : 'caution'

  const roomS = semanticStatus(roomTone)
  const keyS = semanticStatus(keyTone)

  const canToggleRoom =
    selfHoldsKey && room != null && self.role !== 'assistant'
  const showAssistantRequestCard =
    self.role !== 'assistant' && !selfHoldsKey && keyWithAssistant
  const showHolderRequestCard =
    self.role !== 'assistant' && !selfHoldsKey && !keyWithAssistant

  return (
    <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden'>
      <div className='flex flex-col gap-5'>
        <div className='flex flex-col gap-3'>
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
                Status da Sala
              </p>
              {room ? (
                <p
                  className={cn(
                    'text-4xl font-bold tracking-tight sm:text-5xl',
                    roomS.emphasis,
                  )}
                >
                  {room.isOpen ? 'Aberta' : 'Fechada'}
                </p>
              ) : (
                <p className={cn('text-lg font-semibold', roomS.emphasis)}>
                  Configuração pendente
                </p>
              )}
            </div>
          </section>
          {canToggleRoom ? (
            <RoomToggleButton isOpen={room!.isOpen} />
          ) : null}
        </div>

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
              Status da Chave
            </p>
            <div className='flex items-center gap-3'>
              {key.holderId && (
                <KeyRequestRequesterPhoto
                  requesterId={key.holderId}
                  requesterName={key.holderName ?? 'Desconhecido'}
                  photoVersion={key.holderPhotoVersion}
                />
              )}
              <p
                className={cn(
                  'text-3xl font-semibold tracking-tight sm:text-4xl',
                  keyS.titleSoft,
                )}
              >
                {keyHeadline}
              </p>
            </div>
          </div>
        </section>

        {self.role === 'assistant' && assistantCanForceRetrieve ? (
          <AssistantForceRetrieveCard
            currentHolderName={key.holderName}
            currentHolderRole={key.holderRole}
          />
        ) : null}
        {incomingHolderRequests.length > 0 ? (
          <HolderIncomingRequests initialRequests={incomingHolderRequests} />
        ) : null}

        {showAssistantRequestCard ? (
          <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Requisitar chave à secretaria</p>
              <p className='text-muted-foreground text-xs text-pretty'>
                {assistantRequestHint}
              </p>
            </div>
            <RequestKeyButton
              canRequest={canRequestKey}
              pending={pendingRequestId != null}
            />
          </div>
        ) : null}

        {showHolderRequestCard && key.holderId ? (
          <div className='border-border/50 bg-card/60 space-y-3 rounded-2xl border p-4 shadow-sm'>
            <div className='space-y-1'>
              <p className='text-sm font-medium'>Requisitar chave</p>
              <p className='text-muted-foreground text-xs text-pretty'>
                {holderRequestHint}
              </p>
            </div>
            <RequestKeyFromHolderButton
              canRequest={canRequestKeyFromHolder}
              pending={pendingRequestId != null}
              holderName={key.holderName ?? 'quem tem a chave'}
            />
          </div>
        ) : null}

        <MyProfilePictureCard
          memberId={self.id}
          name={self.name}
          photoVersion={self.photoVersion}
        />
      </div>
    </div>
  )
}
