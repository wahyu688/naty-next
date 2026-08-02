import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

// Route Handler client — reads cookies from the incoming request and
// writes any refreshed session cookies onto the outgoing response.
// Use this (not server.ts) inside src/app/api/**/route.ts.
export function createRouteSupabaseClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          res.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          res.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )
}
