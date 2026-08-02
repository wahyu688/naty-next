export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { createRouteSupabaseClient } from '@/lib/supabase/route'

export async function POST(req: NextRequest) {
  const res = NextResponse.json({ success: true })
  const supabase = createRouteSupabaseClient(req, res)
  await supabase.auth.signOut()
  return res
}
