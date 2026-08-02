import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Server Component / Server Action client — read-only cookie access.
// Next.js forbids writing cookies outside a Server Action or Route
// Handler, so `set`/`remove` are no-ops here; the middleware is what
// actually refreshes the session cookie on each request.
export function createServerSupabaseClient() {
  const cookieStore = cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )
}
