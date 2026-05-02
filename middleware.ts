import { jwtVerify } from 'jose'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

import { SESSION_COOKIE } from '@/lib/auth/constants'

async function readPayload(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value
  const secret = process.env.SESSION_SECRET
  if (!token || !secret || secret.length < 32) return null
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret))
    const sub = payload.sub
    const role = payload.role
    if (typeof sub !== 'string' || typeof role !== 'string') return null
    return { sub, role }
  } catch {
    return null
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const p = await readPayload(request)

  if (pathname.startsWith('/admin')) {
    if (!p) return NextResponse.redirect(new URL('/login', request.url))
    if (p.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  if (pathname === '/dashboard') {
    if (!p) return NextResponse.redirect(new URL('/login', request.url))
    return NextResponse.next()
  }

  if (pathname === '/login') {
    if (p) {
      const dest = p.role === 'admin' ? '/admin/members' : '/dashboard'
      return NextResponse.redirect(new URL(dest, request.url))
    }
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard', '/login'],
}
