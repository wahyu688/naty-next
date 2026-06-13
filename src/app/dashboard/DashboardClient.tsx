'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TEAM_COLORS } from '@/lib/data'
import type { MemberRow } from '@/lib/supabase'
import clsx from 'clsx'

// ── TEAM_COLORS accent for each member ─────────────────────
const ACCENTS = TEAM_COLORS.map(c => c.accent)

// ═══════════════════════════════════════════════════════════
// PASSWORD GATE
// ═══════════════════════════════════════════════════════════
function PasswordGate({ onUnlock }: { onUnlock: (pwd: string) => void }) {
  const [input, setInput] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!input.trim()) return
    setLoading(true)
    // Test the password against the API
    const res = await fetch('/api/members', {
      headers: { 'x-dashboard-password': input },
    })
    setLoading(false)
    if (res.ok) {
      onUnlock(input)
    } else {
      setError(true)
      setTimeout(() => setError(false), 1500)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <div className="font-display font-bold text-[28px] tracking-[-0.04em] mb-2">
            NAT<span className="text-violet">Y</span>
          </div>
          <p className="text-[14px] text-muted">Dashboard — team access only</p>
        </div>

        <div className={clsx(
          'bg-surface border rounded-card p-8 transition-all duration-200',
          error ? 'border-red/60 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]' : 'border-white/[0.09]'
        )}>
          <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-3">
            Password
          </label>
          <input
            type="password"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter dashboard password"
            autoFocus
            className="w-full bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px]
                       text-ink outline-none transition-all duration-200
                       focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                       placeholder:text-muted/40"
          />
          {error && (
            <p className="text-[12px] text-red mt-2">Incorrect password</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="mt-4 w-full font-display font-semibold text-[14px] py-3 rounded-sm
                       bg-ink text-bg transition-all duration-200
                       hover:opacity-90 disabled:opacity-50"
          >
            {loading ? 'Checking...' : 'Enter Dashboard →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// AI SUMMARIZE MODAL
// ═══════════════════════════════════════════════════════════
interface SummarizeModalProps {
  member: MemberRow
  password: string
  onApply: (bio: string, tags: string[]) => void
  onClose: () => void
}

function SummarizeModal({ member, password, onApply, onClose }: SummarizeModalProps) {
  const [githubUrl, setGithubUrl] = useState(member.github || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    bio: string
    suggestedTags: string[]
    githubProfile: { username: string; name: string; avatar: string; repos: number; bio: string }
  } | null>(null)
  const [error, setError] = useState('')
  const [editedBio, setEditedBio] = useState('')

  const handleSummarize = async () => {
    if (!githubUrl.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': password,
        },
        body: JSON.stringify({
          githubUrl: githubUrl.trim(),
          memberName: member.name,
          memberRole: member.role,
        }),
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to summarize')
      setResult(data)
      setEditedBio(data.bio)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6
                    bg-bg/90 backdrop-blur-xl"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-white/[0.09] rounded-[20px]
                      w-full max-w-[600px] max-h-[90vh] overflow-y-auto [scrollbar-width:none]">

        {/* Header */}
        <div className="flex items-center justify-between p-7 pb-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[18px]">🤖</span>
              <h3 className="font-display font-bold text-[18px]">AI Summarize</h3>
            </div>
            <p className="text-[13px] text-muted">
              Generate bio for <span className="text-ink font-medium">{member.name}</span> from GitHub
            </p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full bg-surface2 border border-white/[0.05]
                       text-muted text-xl flex items-center justify-center
                       hover:text-ink hover:bg-white/[0.09] transition-colors">
            ×
          </button>
        </div>

        <div className="p-7 space-y-5">
          {/* GitHub URL input */}
          <div>
            <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-2">
              GitHub URL or Username
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSummarize()}
                placeholder="https://github.com/username"
                className="flex-1 bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px]
                           text-ink outline-none transition-all duration-200
                           focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                           placeholder:text-muted/40"
              />
              <button
                onClick={handleSummarize}
                disabled={loading || !githubUrl.trim()}
                className="px-5 py-3 bg-ink text-bg font-display font-semibold text-[13px]
                           rounded-sm transition-all duration-200 hover:opacity-90
                           disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Analyzing...
                  </span>
                ) : 'Analyze →'}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">
              ⚠ {error}
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="space-y-3">
              {['Fetching GitHub profile...', 'Reading repositories...', 'Generating bio with Claude...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-muted">
                  <span className="w-3.5 h-3.5 border-2 border-violet/30 border-t-violet rounded-full animate-spin flex-shrink-0" />
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="space-y-5">
              <div className="h-px bg-white/[0.05]" />

              {/* GitHub profile preview */}
              <div className="flex items-center gap-4 p-4 bg-bg rounded-card border border-white/[0.05]">
                {result.githubProfile.avatar && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={result.githubProfile.avatar}
                    alt={result.githubProfile.username}
                    className="w-12 h-12 rounded-full border border-white/10"
                  />
                )}
                <div>
                  <div className="font-display font-semibold text-[14px]">
                    {result.githubProfile.name || result.githubProfile.username}
                  </div>
                  <div className="text-[12px] text-muted">
                    @{result.githubProfile.username} · {result.githubProfile.repos} public repos
                  </div>
                  {result.githubProfile.bio && (
                    <div className="text-[12px] text-muted/70 mt-1 italic">{result.githubProfile.bio}</div>
                  )}
                </div>
              </div>

              {/* Generated bio — editable */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-medium tracking-[0.08em] uppercase text-violet-soft">
                    Generated Bio
                  </label>
                  <span className="text-[11px] text-muted">{editedBio.split(' ').length} words</span>
                </div>
                <textarea
                  value={editedBio}
                  onChange={e => setEditedBio(e.target.value)}
                  rows={4}
                  className="w-full bg-bg border border-violet/30 rounded-sm px-4 py-3 text-[14px]
                             text-ink outline-none resize-none leading-[1.7]
                             focus:border-violet/60 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                             transition-all duration-200"
                />
                <p className="text-[11px] text-muted mt-1">Edit before applying if needed</p>
              </div>

              {/* Suggested tags */}
              {result.suggestedTags.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-2">
                    Detected Languages / Tags
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {result.suggestedTags.map(t => (
                      <span key={t} className="tag text-[12px]">{t}</span>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted mt-1">These will be added to existing tags</p>
                </div>
              )}

              {/* Apply button */}
              <button
                onClick={() => {
                  onApply(editedBio, result.suggestedTags)
                  onClose()
                }}
                className="w-full font-display font-semibold text-[14px] py-3.5 rounded-sm
                           bg-ink text-bg transition-all duration-200
                           hover:opacity-90 hover:shadow-[0_8px_24px_rgba(255,255,255,0.2)]"
              >
                ✓ Apply to profile
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MEMBER EDITOR CARD
// ═══════════════════════════════════════════════════════════
interface MemberEditorProps {
  member: MemberRow
  password: string
  onSaved: (updated: MemberRow) => void
}

function MemberEditor({ member, password, onSaved }: MemberEditorProps) {
  const [form, setForm] = useState<MemberRow>({ ...member })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSummarize, setShowSummarize] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accent = ACCENTS[member.id] ?? '#ededed'

  const set = (key: keyof MemberRow, val: any) =>
    setForm(prev => ({ ...prev, [key]: val }))

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !form.tags.includes(t)) {
      set('tags', [...form.tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter(t => t !== tag))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-dashboard-password': password,
        },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      const updated = await res.json()
      onSaved(updated)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch {
      alert('Failed to save. Check your Supabase connection.')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoUploading(true)

    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const ext  = file.name.split('.').pop()
    const path = `member-${member.id}-${Date.now()}.${ext}`
    const { error } = await sb.storage.from('member-photos').upload(path, file, { upsert: true })

    if (!error) {
      const { data } = sb.storage.from('member-photos').getPublicUrl(path)
      set('photo_url', data.publicUrl)
    }
    setPhotoUploading(false)
  }

  const handleAISummarize = (bio: string, tags: string[]) => {
    set('bio', bio)
    // Merge new tags (avoid duplicates)
    const merged = [...new Set([...form.tags, ...tags])]
    set('tags', merged)
  }

  return (
    <>
      <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden
                      transition-all duration-200 hover:border-white/10">

        {/* Card header accent bar */}
        <div className="h-1 w-full" style={{ background: accent }} />

        <div className="p-6">
          {/* Member header */}
          <div className="flex items-center gap-4 mb-6">
            {/* Avatar / photo */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden
                              flex items-center justify-center font-display font-bold text-[18px]"
                   style={{ background: `${accent}20`, color: accent }}>
                {form.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo_url} alt={form.name} className="w-full h-full object-cover" />
                ) : (
                  form.name.split(' ').map(w => w[0]).slice(0, 2).join('')
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={photoUploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface2
                           border border-white/10 text-[11px] flex items-center justify-center
                           hover:bg-white/10 transition-colors"
                title="Upload photo"
              >
                {photoUploading ? '⏳' : '📷'}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] truncate">{form.name}</div>
              <div className="text-[12px] text-muted truncate">{form.role}</div>
            </div>

            {/* AI summarize button */}
            <button
              onClick={() => setShowSummarize(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium
                         border border-white/[0.09] text-muted hover:text-ink hover:border-white/20
                         transition-all duration-200 flex-shrink-0"
            >
              <span>🤖</span> AI Bio
            </button>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                Full Name
              </label>
              <input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5
                           text-[13px] text-ink outline-none transition-all duration-200
                           focus:border-violet/40 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                Role
              </label>
              <input
                value={form.role}
                onChange={e => set('role', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5
                           text-[13px] text-ink outline-none transition-all duration-200
                           focus:border-violet/40 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]"
              />
            </div>

            {/* Bio */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-muted">Bio</label>
                <span className="text-[11px] text-muted">{form.bio.split(' ').filter(Boolean).length} words</span>
              </div>
              <textarea
                value={form.bio}
                onChange={e => set('bio', e.target.value)}
                rows={3}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5
                           text-[13px] text-ink outline-none resize-none leading-[1.65]
                           focus:border-violet/40 focus:shadow-[0_0_0_2px_rgba(255,255,255,0.06)]
                           transition-all duration-200"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                Tags / Skills
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {form.tags.map(t => (
                  <span key={t}
                    className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1
                               rounded-full bg-[rgba(255,255,255,0.08)] text-violet-soft
                               border border-[rgba(255,255,255,0.12)]">
                    {t}
                    <button onClick={() => removeTag(t)} className="hover:text-red transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                  placeholder="Add tag, press Enter"
                  className="flex-1 bg-bg border border-white/[0.07] rounded-sm px-3 py-2
                             text-[13px] text-ink outline-none transition-all duration-200
                             focus:border-violet/40 placeholder:text-muted/40"
                />
                <button onClick={addTag}
                  className="px-3 py-2 bg-surface2 border border-white/[0.07] rounded-sm
                             text-[13px] text-muted hover:text-ink transition-colors">
                  +
                </button>
              </div>
            </div>

            {/* Links */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                  GitHub
                </label>
                <input
                  value={form.github}
                  onChange={e => set('github', e.target.value)}
                  placeholder="https://github.com/..."
                  className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5
                             text-[13px] text-ink outline-none transition-all duration-200
                             focus:border-violet/40 placeholder:text-muted/40"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                  LinkedIn
                </label>
                <input
                  value={form.linkedin}
                  onChange={e => set('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5
                             text-[13px] text-ink outline-none transition-all duration-200
                             focus:border-violet/40 placeholder:text-muted/40"
                />
              </div>
            </div>
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            className={clsx(
              'mt-5 w-full font-display font-semibold text-[13px] py-3 rounded-sm',
              'transition-all duration-200',
              saved
                ? 'bg-white/10 text-ink border border-white/25'
                : 'bg-ink text-bg hover:opacity-90 disabled:opacity-50'
            )}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>

      {/* AI Summarize modal */}
      {showSummarize && (
        <SummarizeModal
          member={form}
          password={password}
          onApply={handleAISummarize}
          onClose={() => setShowSummarize(false)}
        />
      )}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function DashboardClient() {
  const [password, setPassword] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<number | 'all'>('all')

  // Load from sessionStorage so password persists on refresh
  useEffect(() => {
    const cached = sessionStorage.getItem('naty_dashboard_pwd')
    if (cached) setPassword(cached)
  }, [])

  const handleUnlock = useCallback(async (pwd: string) => {
    sessionStorage.setItem('naty_dashboard_pwd', pwd)
    setPassword(pwd)
  }, [])

  // Fetch members once password is set
  useEffect(() => {
    if (!password) return
    setLoading(true)
    fetch('/api/members', {
      headers: { 'x-dashboard-password': password },
    })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMembers(data) })
      .finally(() => setLoading(false))
  }, [password])

  const handleLogout = () => {
    sessionStorage.removeItem('naty_dashboard_pwd')
    setPassword(null)
    setMembers([])
  }

  if (!password) return <PasswordGate onUnlock={handleUnlock} />

  const displayedMembers = activeTab === 'all'
    ? members
    : members.filter(m => m.id === activeTab)

  return (
    <div className="min-h-screen bg-bg">
      {/* Dashboard nav */}
      <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-[18px]">
              NAT<span className="text-violet">Y</span>
            </span>
            <span className="text-[12px] text-muted border border-white/[0.07] px-2.5 py-0.5 rounded-full">
              Dashboard
            </span>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank"
               className="text-[13px] text-muted hover:text-ink transition-colors">
              View site →
            </a>
            <button onClick={handleLogout}
              className="text-[13px] text-muted hover:text-red transition-colors">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">
            Member Profiles
          </h1>
          <p className="text-[14px] text-muted">
            Edit team member information. Changes are saved to Supabase and reflected live on the portfolio.
          </p>
        </div>

        {/* Member tabs */}
        <div className="flex gap-2 flex-wrap mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={clsx(
              'font-display text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200',
              activeTab === 'all'
                ? 'bg-ink border-ink text-bg'
                : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20'
            )}
          >
            All members
          </button>
          {members.map(m => (
            <button
              key={m.id}
              onClick={() => setActiveTab(m.id)}
              className={clsx(
                'font-display text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200',
                activeTab === m.id
                  ? 'text-bg border-transparent'
                  : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20'
              )}
              style={activeTab === m.id ? { background: ACCENTS[m.id], borderColor: ACCENTS[m.id] } : {}}
            >
              {m.short_name}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[480px] animate-pulse" />
            ))}
          </div>
        )}

        {/* Member cards */}
        {!loading && (
          <div className={clsx(
            'grid gap-5',
            activeTab === 'all'
              ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
              : 'grid-cols-1 max-w-[560px]'
          )}>
            {displayedMembers.map(m => (
              <MemberEditor
                key={m.id}
                member={m}
                password={password}
                onSaved={updated =>
                  setMembers(prev => prev.map(p => p.id === updated.id ? updated : p))
                }
              />
            ))}
          </div>
        )}

        {/* Info box */}
        <div className="mt-12 p-5 bg-surface border border-white/[0.05] rounded-card
                        text-[13px] text-muted flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="font-medium text-ink mb-1">🤖 AI Bio Generation</div>
            Click <strong className="text-ink">AI Bio</strong> on any member card → enter their GitHub URL → Claude analyzes their repos and generates a professional bio. You can edit before applying.
          </div>
          <div className="flex-1">
            <div className="font-medium text-ink mb-1">💾 Auto-save to Supabase</div>
            Click <strong className="text-ink">Save changes</strong> to persist to database. The live portfolio at <code className="text-violet-soft">/</code> reads from Supabase on every request.
          </div>
        </div>
      </div>
    </div>
  )
}
