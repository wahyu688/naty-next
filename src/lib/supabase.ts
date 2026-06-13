import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Public client — for portfolio pages (read-only)
export const supabase = createClient(supabaseUrl, supabaseAnon)

// Service role client — for dashboard API routes (full access)
export function getServiceSupabase() {
  return createClient(
    supabaseUrl,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export type MemberRow = {
  id:         number
  name:       string
  short_name: string
  role:       string
  bio:        string
  tags:       string[]
  github:     string
  linkedin:   string
  photo_url:  string | null
  updated_at: string
}
