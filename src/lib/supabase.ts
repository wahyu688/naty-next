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
  id:             number
  name:           string
  short_name:     string
  role:           string
  bio:            string
  tags:           string[]
  github:         string
  linkedin:       string
  cv_url:         string | null
  portfolio_url:  string | null
  photo_url:      string | null
  updated_at:     string
}

export type ProjectRow = {
  id:            string
  name:          string
  type:          string
  categories:    string[]
  status:        string
  emoji:         string
  gradient_from: string
  gradient_to:   string
  featured:      boolean
  members:       number[]
  description:   string
  stack:         string[]
  overview:      string
  challenge:     string
  solution:      string
  year:          string
  role:          string
  link:          string | null
  preview_url:   string | null
  sort_order:    number
  created_at?:   string
  updated_at?:   string
}

export type PricingRow = {
  id:         string
  name:       string
  price:      string
  tagline:    string
  features:   string[]
  featured:   boolean
  sort_order: number
  created_at?: string
  updated_at?: string
}

export type TimelineRow = {
  id:          string
  year:        string
  month:       string
  type:        string
  title:       string
  description: string
  member_id:   number
  sort_order:  number
  created_at?: string
  updated_at?: string
}

export type ContactSubmission = {
  id:         string
  name:       string
  email:      string
  message:    string
  service:    string
  budget:     string
  company:    string
  is_read:    boolean
  created_at: string
}
