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
  id:            number
  name:          string
  short_name:    string
  role:          string
  bio:           string
  tags:          string[]
  github:        string
  linkedin:      string
  cv:            string | null
  portfolio:     string | null
  photo_url:     string | null
  updated_at:    string
  // M2 — auth/access control. Never selected by public (anon) queries;
  // column-level grants in 0002_members_auth.sql enforce this at the DB.
  auth_user_id?: string | null
  email?:        string | null
  access_role?:  'ADMIN' | 'PM' | 'MEMBER'
  status?:       'AKTIF' | 'CUTI' | 'TIDAK_AKTIF'
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
  id:            string
  name:          string
  email:         string
  message:       string
  service:       string
  budget:        string
  company:       string
  is_read:       boolean
  created_at:    string
  // M3 — lead pipeline
  status:        'BARU' | 'DIKUALIFIKASI' | 'DITUTUP' | 'JADI_ENGAGEMENT'
  finder_id:     number | null
  closed_reason: string | null
}

export type EngagementPhase =
  | 'LEAD_MASUK' | 'KUALIFIKASI' | 'SCOPING' | 'PENAWARAN_KONTRAK'
  | 'KICKOFF' | 'EKSEKUSI' | 'QA_REVISI' | 'SERAH_TERIMA'

export type EngagementRow = {
  id:                    string
  code:                  string
  public_slug:           string
  client_name:           string
  client_contact:        string | null
  submission_id:         string | null
  finder_id:             number | null
  value:                 number
  phase:                 EngagementPhase
  revision_quota:        number
  revision_used:         number
  dp_received_at:        string | null
  paid_off_at:           string | null
  target_date:           string | null
  progress_percent:      number
  public_note:           string | null
  published_project_id:  string | null
  created_at:            string
  updated_at:            string
}

export type TaskStatus = 'BACKLOG' | 'DIKERJAKAN' | 'DIREVIEW' | 'SELESAI'

export type SprintRow = {
  id:            string
  engagement_id: string
  number:        number
  start_date:    string | null
  end_date:      string | null
  goal:          string | null
  created_at:    string
  updated_at:    string
}

export type TaskRow = {
  id:            string
  engagement_id: string
  sprint_id:     string | null
  title:         string
  description:   string | null
  status:        TaskStatus
  assignee_id:   number | null
  discipline:    string | null
  sort_order:    number
  created_at:    string
  updated_at:    string
}

export type StandupRow = {
  id:         string
  sprint_id:  string
  member_id:  number
  date:       string
  yesterday:  string | null
  today:      string | null
  blocker:    string | null
  created_at: string
}

export type ChangeRequestRow = {
  id:            string
  engagement_id: string
  description:   string
  decision:      'GRATIS' | 'BERBAYAR' | 'FASE_2' | null
  extra_charge:  number
  decided_by:    number | null
  decided_at:    string | null
  created_at:    string
}

export type ActivityLogRow = {
  id:            string
  engagement_id: string | null
  submission_id: string | null
  actor_id:      number | null
  action:        string
  metadata:      Record<string, unknown>
  created_at:    string
}
