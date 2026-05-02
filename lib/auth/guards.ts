import { getSession } from './session'

export async function requireAuth() {
  const { member } = await getSession()
  if (!member) {
    throw new Error('Unauthorized')
  }
  return member
}

export async function requireAdmin() {
  const member = await requireAuth()
  if (member.role !== 'admin') {
    throw new Error('Forbidden')
  }
  return member
}

export async function requireAssistant() {
  const member = await requireAuth()
  if (member.role !== 'assistant') {
    throw new Error('Forbidden')
  }
  return member
}
