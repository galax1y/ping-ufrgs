import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function historyPath(keyPage: number, roomPage: number) {
  const params = new URLSearchParams()
  if (keyPage > 1) params.set('keyPage', String(keyPage))
  if (roomPage > 1) params.set('roomPage', String(roomPage))
  const q = params.toString()
  return q ? `/dashboard/history?${q}` : '/dashboard/history'
}

type HistoryPaginationProps = {
  section: 'key' | 'room'
  page: number
  total: number
  pageSize: number
  keyPage: number
  roomPage: number
}

export function HistoryPagination({
  section,
  page,
  total,
  pageSize,
  keyPage,
  roomPage,
}: HistoryPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const showingFrom = total === 0 ? 0 : (page - 1) * pageSize + 1
  const showingTo = Math.min(page * pageSize, total)

  const prevHref =
    section === 'key'
      ? historyPath(page - 1, roomPage)
      : historyPath(keyPage, page - 1)
  const nextHref =
    section === 'key'
      ? historyPath(page + 1, roomPage)
      : historyPath(keyPage, page + 1)

  const canPrev = page > 1
  const canNext = page < totalPages

  return (
    <div
      className={cn(
        'mt-3 flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3',
        total > 0 && 'border-border/50 border-t pt-3',
      )}
    >
      <p className='text-muted-foreground text-[11px] tabular-nums sm:text-xs'>
        {total === 0 ? (
          'No entries in this log.'
        ) : (
          <>
            Showing {showingFrom}–{showingTo} of {total}
            <span className='text-muted-foreground/80 hidden sm:inline'>
              {' '}
              · Page {page} of {totalPages}
            </span>
          </>
        )}
      </p>
      {total > 0 ? (
        <div className='flex items-center gap-2'>
          {canPrev ? (
            <Button
              variant='outline'
              size='xs'
              className='h-7 gap-1 px-2 text-xs'
              asChild
            >
              <Link href={prevHref} prefetch={false}>
                <ChevronLeft className='size-3.5' />
                Previous
              </Link>
            </Button>
          ) : (
            <Button
              variant='outline'
              size='xs'
              className='h-7 gap-1 px-2 text-xs'
              disabled
            >
              <ChevronLeft className='size-3.5' />
              Previous
            </Button>
          )}
          {canNext ? (
            <Button
              variant='outline'
              size='xs'
              className='h-7 gap-1 px-2 text-xs'
              asChild
            >
              <Link href={nextHref} prefetch={false}>
                Next
                <ChevronRight className='size-3.5' />
              </Link>
            </Button>
          ) : (
            <Button
              variant='outline'
              size='xs'
              className='h-7 gap-1 px-2 text-xs'
              disabled
            >
              Next
              <ChevronRight className='size-3.5' />
            </Button>
          )}
        </div>
      ) : null}
    </div>
  )
}
