import { redirect } from 'next/navigation'
import { DoorOpen, KeyRound } from 'lucide-react'

import { getActivityHistory } from '@/actions/member/get-activity-history'
import type {
  KeyHistoryItem,
  RoomHistoryItem,
} from '@/actions/member/get-activity-history'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getSession } from '@/lib/auth/session'
import { actorStyle } from '@/lib/actor-colors'
import { cn } from '@/lib/utils'

import { HistoryPagination, historyPath } from './history-pagination'

export const dynamic = 'force-dynamic'

function formatWhen(d: Date) {
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

type HistoryRow = KeyHistoryItem | RoomHistoryItem

function parsePageParam(v: string | string[] | undefined): number {
  const raw = Array.isArray(v) ? v[0] : v
  const n = parseInt(raw ?? '1', 10)
  return Number.isFinite(n) && n >= 1 ? n : 1
}

function HistoryEventList({
  items,
  emptyLabel,
  highlightKeyLogId = null,
}: {
  items: HistoryRow[]
  emptyLabel: string
  /** When set, the row with this log id is the latest concrete custody change (key tab). */
  highlightKeyLogId?: number | null
}) {
  if (items.length === 0) {
    return <p className='text-muted-foreground text-xs'>{emptyLabel}</p>
  }

  const showMovementHint =
    highlightKeyLogId != null && items.some((e) => e.id === highlightKeyLogId)

  return (
    <div className='space-y-2'>
      <ol className='border-border/60 divide-border/60 bg-card/40 divide-y rounded-xl border'>
        {items.map((e) => {
          const isLatestConcrete =
            highlightKeyLogId != null && e.id === highlightKeyLogId
          const { text: actorTextClass } = actorStyle(e.actorName)
          return (
            <li
              key={e.id}
              className={cn(
                'flex items-start gap-2 px-2.5 py-2 sm:gap-2.5 sm:px-3',
                isLatestConcrete &&
                'bg-primary/10 ring-primary/25 ring-1 ring-inset',
              )}
              aria-current={isLatestConcrete ? 'true' : undefined}
            >
              <div className='min-w-0 flex-1 space-y-0.5'>
                <p className='text-[13px] leading-tight sm:text-sm'>
                  {e.headline}
                </p>
                <div className='flex flex-wrap items-center gap-1'>
                  <Badge
                    variant='secondary'
                    className='px-1.5 py-px text-[10px] font-normal'
                  >
                    {e.sourceLabel}
                  </Badge>
                  <span
                    className={cn('text-[11px] font-medium', actorTextClass)}
                  >
                    {e.actorName}
                  </span>
                </div>
                {e.detail ? (
                  <p className='text-muted-foreground mt-0.5 text-[11px] leading-snug italic sm:text-xs'>
                    {e.detail}
                  </p>
                ) : null}
              </div>
              <time
                dateTime={e.at.toISOString()}
                className='text-muted-foreground shrink-0 pt-px text-right text-[10px] leading-none whitespace-nowrap tabular-nums sm:text-[11px] sm:leading-tight'
              >
                {formatWhen(e.at)}
              </time>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    keyPage?: string | string[]
    roomPage?: string | string[]
  }>
}) {
  const { member } = await getSession()
  if (!member) {
    redirect('/login')
  }

  const sp = await searchParams
  const rawKeyPage = parsePageParam(sp.keyPage)
  const rawRoomPage = parsePageParam(sp.roomPage)

  const {
    keyHistory,
    roomHistory,
    keyTotal,
    roomTotal,
    keyPage,
    roomPage,
    pageSize,
    latestConcreteKeyMovementId,
  } = await getActivityHistory({
    keyPage: rawKeyPage,
    roomPage: rawRoomPage,
  })

  if (keyPage !== rawKeyPage || roomPage !== rawRoomPage) {
    redirect(historyPath(keyPage, roomPage))
  }

  return (
    <div className='flex min-h-0 flex-1 flex-col gap-4 overflow-hidden sm:gap-6'>
      <div className='shrink-0'>
        <h1 className='text-xl font-semibold tracking-tight'>
          Histórico de atividades
        </h1>
        <p className='text-muted-foreground mt-1 text-sm text-pretty'>
          Transações de posse de chave e eventos de abrir/fechar a sala.
        </p>
      </div>

      <Tabs
        defaultValue='key-custody'
        className='flex min-h-0 w-full flex-1 flex-col gap-3 overflow-hidden'
      >
        <TabsList className='h-auto shrink-0 flex-wrap justify-start gap-0.5 p-1 sm:flex-nowrap'>
          <TabsTrigger
            value='key-custody'
            className='gap-1.5 px-2.5 py-1.5 text-xs'
          >
            <span className='bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md'>
              <KeyRound className='size-3' />
            </span>
            Posse de chave
          </TabsTrigger>
          <TabsTrigger value='room' className='gap-1.5 px-2.5 py-1.5 text-xs'>
            <span className='bg-primary/15 text-primary flex size-7 items-center justify-center rounded-md'>
              <DoorOpen className='size-3' />
            </span>
            Sala
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value='key-custody'
          className='mt-0 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden data-[state=inactive]:hidden'
        >
          <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'>
            <HistoryEventList
              items={keyHistory}
              emptyLabel='Nenhum evento de chave ainda.'
              highlightKeyLogId={latestConcreteKeyMovementId}
            />
          </div>
          <HistoryPagination
            section='key'
            page={keyPage}
            total={keyTotal}
            pageSize={pageSize}
            keyPage={keyPage}
            roomPage={roomPage}
          />
        </TabsContent>

        <TabsContent
          value='room'
          className='mt-0 flex min-h-0 flex-1 flex-col gap-3 overflow-hidden data-[state=inactive]:hidden'
        >
          <div className='min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain'>
            <HistoryEventList
              items={roomHistory}
              emptyLabel='Nenhum evento de sala ainda.'
            />
          </div>
          <HistoryPagination
            section='room'
            page={roomPage}
            total={roomTotal}
            pageSize={pageSize}
            keyPage={keyPage}
            roomPage={roomPage}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
