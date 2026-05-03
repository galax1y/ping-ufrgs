'use server'

import { desc, eq, ne, sql } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'

import database from '@/database'
import {
  keyOwnershipLogInPing,
  membersInPing,
  roomStatusLogInPing,
} from '@/database/drizzle/schema'
import { requireAuth } from '@/lib/auth/guards'
import { HISTORY_PAGE_SIZE } from '@/lib/history-pagination'


export type KeyHistoryItem = {
  id: number
  at: Date
  actorName: string
  headline: string
  detail: string | null
  sourceLabel: string
}

export type RoomHistoryItem = {
  id: number
  at: Date
  actorName: string
  headline: string
  detail: string | null
  sourceLabel: string
}

function labelKeySource(source: string): string {
  const labels: Record<string, string> = {
    request_created: 'Solicitação',
    request_approved: 'Aprovação',
    member_trade: 'Transferência',
    assistant_return: 'Assistente',
    admin_action: 'Admin',
    initial: 'Inicial',
  }
  return labels[source] ?? source
}

function labelRoomSource(source: string): string {
  return source === 'admin_override' ? 'Sobrescrição de Admin' : 'Portador da chave'
}

function holderLabel(
  id: string | null | undefined,
  name: string | null | undefined,
): string {
  if (id == null) return ""
  const n = name?.trim()
  return n || 'Usuário desconhecido'
}

function keyEventHeadline(row: {
  source: string
  actorName: string | null
  previousHolderId: string | null
  previousHolderName: string | null
  newHolderId: string | null
  newHolderName: string | null
  note: string | null
}): { headline: string; detail: string | null } {
  const actor = row.actorName?.trim() || 'Usuário desconhecido'
  const prev = holderLabel(row.previousHolderId, row.previousHolderName)
  const next = holderLabel(row.newHolderId, row.newHolderName)

  switch (row.source) {
    case 'request_created':
      return {
        headline: `${actor} requisitou a chave à secretaria.`,
        detail: row.note ? `Nota: ${row.note}` : null,
      }
    case 'request_approved':
      return {
        headline: `${actor} aprovou a requisição — a chave foi de ${prev} para ${next}.`,
        detail: null,
      }
    case 'assistant_return':
      return {
        headline: `${actor} assumiu a posse da chave (era de ${prev}).`,
        detail: row.note ?? null,
      }
    case 'admin_action':
      if (row.newHolderId == null && row.previousHolderId != null) {
        return {
          headline: `${actor} moveu a chave para a secretaria.`,
          detail: row.note ?? null,
        }
      }
      return {
        headline: `${actor} atualizou a posse da chave (${prev} → ${next}).`,
        detail: row.note ?? null,
      }
    case 'initial':
      return {
        headline: 'Posse inicial da chave registrada.',
        detail: row.note ?? null,
      }
    case 'member_trade':
    default:
      return {
        headline: `A custódia da chave mudou de ${prev} para ${next}.`,
        detail: row.note ?? null,
      }
  }
}

function roomEventHeadline(row: {
  actorName: string | null
  isOpen: boolean
  source: string
  note: string | null
}): { headline: string; detail: string | null } {
  const actor = row.actorName?.trim() || 'Usuário desconhecido'
  const action = row.isOpen ? 'abriu a sala' : 'fechou a sala'
  const via = row.source === 'admin_override' ? ' ação de admin' : ''
  return {
    headline: `${actor} ${action}${via}.`,
    detail: row.note ?? null,
  }
}

function normalizePage(page: number): number {
  if (!Number.isFinite(page) || page < 1) return 1
  return Math.floor(page)
}

function clampPage(page: number, total: number, pageSize: number): number {
  const maxPage = Math.max(1, Math.ceil(total / pageSize))
  return Math.min(Math.max(1, page), maxPage)
}

export type GetActivityHistoryOptions = {
  keyPage: number
  roomPage: number
  pageSize?: number
}

export async function getActivityHistory(
  options: GetActivityHistoryOptions,
): Promise<{
  keyHistory: KeyHistoryItem[]
  roomHistory: RoomHistoryItem[]
  keyTotal: number
  roomTotal: number
  keyPage: number
  roomPage: number
  pageSize: number
  /** Most recent log row that reflects an actual custody change (excludes `request_created`). */
  latestConcreteKeyMovementId: number | null
}> {
  await requireAuth()

  const pageSize = options.pageSize ?? HISTORY_PAGE_SIZE

  const [keyCountRow, roomCountRow, latestConcreteRow] = await Promise.all([
    database
      .select({ n: sql<number>`cast(count(*) as int)` })
      .from(keyOwnershipLogInPing),
    database
      .select({ n: sql<number>`cast(count(*) as int)` })
      .from(roomStatusLogInPing),
    database
      .select({ id: keyOwnershipLogInPing.id })
      .from(keyOwnershipLogInPing)
      .where(ne(keyOwnershipLogInPing.source, 'request_created'))
      .orderBy(desc(keyOwnershipLogInPing.createdAt))
      .limit(1),
  ])

  const keyTotal = keyCountRow[0]?.n ?? 0
  const roomTotal = roomCountRow[0]?.n ?? 0

  const rawKeyPage = normalizePage(options.keyPage)
  const rawRoomPage = normalizePage(options.roomPage)
  const keyPage = clampPage(rawKeyPage, keyTotal, pageSize)
  const roomPage = clampPage(rawRoomPage, roomTotal, pageSize)

  const keyOffset = (keyPage - 1) * pageSize
  const roomOffset = (roomPage - 1) * pageSize

  const actorM = alias(membersInPing, 'key_actor')
  const prevM = alias(membersInPing, 'key_prev')
  const nextM = alias(membersInPing, 'key_next')
  const roomActor = alias(membersInPing, 'room_actor')

  const [keyRows, roomRows] = await Promise.all([
    database
      .select({
        id: keyOwnershipLogInPing.id,
        createdAt: keyOwnershipLogInPing.createdAt,
        source: keyOwnershipLogInPing.source,
        note: keyOwnershipLogInPing.note,
        previousHolderId: keyOwnershipLogInPing.previousHolderId,
        newHolderId: keyOwnershipLogInPing.newHolderId,
        actorName: actorM.name,
        previousHolderName: prevM.name,
        newHolderName: nextM.name,
      })
      .from(keyOwnershipLogInPing)
      .leftJoin(actorM, eq(keyOwnershipLogInPing.actorId, actorM.id))
      .leftJoin(prevM, eq(keyOwnershipLogInPing.previousHolderId, prevM.id))
      .leftJoin(nextM, eq(keyOwnershipLogInPing.newHolderId, nextM.id))
      .orderBy(desc(keyOwnershipLogInPing.createdAt))
      .limit(pageSize)
      .offset(keyOffset),
    database
      .select({
        id: roomStatusLogInPing.id,
        createdAt: roomStatusLogInPing.createdAt,
        isOpen: roomStatusLogInPing.isOpen,
        source: roomStatusLogInPing.source,
        note: roomStatusLogInPing.note,
        actorName: roomActor.name,
      })
      .from(roomStatusLogInPing)
      .leftJoin(roomActor, eq(roomStatusLogInPing.actorId, roomActor.id))
      .orderBy(desc(roomStatusLogInPing.createdAt))
      .limit(pageSize)
      .offset(roomOffset),
  ])

  const keyHistory: KeyHistoryItem[] = keyRows.map((r) => {
    const { headline, detail } = keyEventHeadline(r)
    return {
      id: r.id,
      at: r.createdAt,
      actorName: r.actorName?.trim() || 'Usuário desconhecido',
      headline,
      detail,
      sourceLabel: labelKeySource(r.source),
    }
  })

  const roomHistory: RoomHistoryItem[] = roomRows.map((r) => {
    const { headline, detail } = roomEventHeadline(r)
    return {
      id: r.id,
      at: r.createdAt,
      actorName: r.actorName?.trim() || 'Usuário desconhecido',
      headline,
      detail,
      sourceLabel: labelRoomSource(r.source),
    }
  })

  const latestConcreteKeyMovementId = latestConcreteRow[0]?.id ?? null

  return {
    keyHistory,
    roomHistory,
    keyTotal,
    roomTotal,
    keyPage,
    roomPage,
    pageSize,
    latestConcreteKeyMovementId,
  }
}
