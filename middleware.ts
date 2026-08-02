import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { isRateLimited } from '@/lib/trackRateLimit'

export async function middleware(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/track/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    if (isRateLimited(ip)) {
      return new NextResponse('Too many requests', { status: 429 })
    }
  }
  return updateSession(req)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logoN.svg|logo.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
