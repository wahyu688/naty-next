'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { TEAM_COLORS } from '@/lib/data'
import type { MemberRow, ProjectRow, PricingRow, TimelineRow, ContactSubmission } from '@/lib/supabase'
import clsx from 'clsx'

const ACCENTS = TEAM_COLORS.map(c => c.accent)
type Section = 'members' | 'projects' | 'pricing' | 'timeline' | 'inquiries'

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
    const res = await fetch('/api/members', { headers: { 'x-dashboard-password': input } })
    setLoading(false)
    if (res.ok) { onUnlock(input) } else {
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
        <div className={clsx('bg-surface border rounded-card p-8 transition-all duration-200',
          error ? 'border-red/60 shadow-[0_0_0_3px_rgba(255,255,255,0.12)]' : 'border-white/[0.09]')}>
          <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-3">Password</label>
          <input type="password" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Enter dashboard password" autoFocus
            className="w-full bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px]
                       text-ink outline-none transition-all duration-200
                       focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                       placeholder:text-muted/40" />
          {error && <p className="text-[12px] text-red mt-2">Incorrect password</p>}
          <button onClick={handleSubmit} disabled={loading}
            className="mt-4 w-full font-display font-semibold text-[14px] py-3 rounded-sm
                       bg-ink text-bg transition-all duration-200 hover:opacity-90 disabled:opacity-50">
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
  member: MemberRow; password: string
  onApply: (bio: string, tags: string[]) => void
  onClose: () => void
}

function SummarizeModal({ member, password, onApply, onClose }: SummarizeModalProps) {
  const [githubUrl, setGithubUrl] = useState(member.github || '')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ bio: string; suggestedTags: string[]; githubProfile: any } | null>(null)
  const [error, setError] = useState('')
  const [editedBio, setEditedBio] = useState('')

  const handleSummarize = async () => {
    if (!githubUrl.trim()) return
    setLoading(true); setError(''); setResult(null)
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ githubUrl: githubUrl.trim(), memberName: member.name, memberRole: member.role }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setResult(data); setEditedBio(data.bio)
    } catch (err: any) { setError(err.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-white/[0.09] rounded-[20px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-center justify-between p-7 pb-0">
          <div>
            <div className="flex items-center gap-2 mb-1"><span className="text-[18px]">🤖</span>
              <h3 className="font-display font-bold text-[18px]">AI Summarize</h3></div>
            <p className="text-[13px] text-muted">Generate bio for <span className="text-ink font-medium">{member.name}</span> from GitHub</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface2 border border-white/[0.05] text-muted text-xl flex items-center justify-center hover:text-ink hover:bg-white/[0.09] transition-colors">×</button>
        </div>
        <div className="p-7 space-y-5">
          <div>
            <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-2">GitHub URL or Username</label>
            <div className="flex gap-2">
              <input type="text" value={githubUrl} onChange={e => setGithubUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSummarize()}
                placeholder="https://github.com/username"
                className="flex-1 bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px] text-ink outline-none transition-all duration-200 focus:border-violet/50 placeholder:text-muted/40" />
              <button onClick={handleSummarize} disabled={loading || !githubUrl.trim()}
                className="px-5 py-3 bg-ink text-bg font-display font-semibold text-[13px] rounded-sm transition-all duration-200 hover:opacity-90 disabled:opacity-40 whitespace-nowrap">
                {loading ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Analyzing...</span> : 'Analyze →'}
              </button>
            </div>
          </div>
          {error && <div className="p-4 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}
          {loading && (
            <div className="space-y-3">
              {['Fetching GitHub profile...','Reading repositories...','Generating bio with AI...'].map((s, i) => (
                <div key={i} className="flex items-center gap-3 text-[13px] text-muted">
                  <span className="w-3.5 h-3.5 border-2 border-violet/30 border-t-violet rounded-full animate-spin flex-shrink-0" />{s}
                </div>
              ))}
            </div>
          )}
          {result && (
            <div className="space-y-5">
              <div className="h-px bg-white/[0.05]" />
              <div className="flex items-center gap-4 p-4 bg-bg rounded-card border border-white/[0.05]">
                {result.githubProfile.avatar && <img src={result.githubProfile.avatar} alt="" className="w-12 h-12 rounded-full border border-white/10" />}
                <div>
                  <div className="font-display font-semibold text-[14px]">{result.githubProfile.name || result.githubProfile.username}</div>
                  <div className="text-[12px] text-muted">@{result.githubProfile.username} · {result.githubProfile.repos} public repos</div>
                  {result.githubProfile.bio && <div className="text-[12px] text-muted/70 mt-1 italic">{result.githubProfile.bio}</div>}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-[12px] font-medium tracking-[0.08em] uppercase text-violet-soft">Generated Bio</label>
                  <span className="text-[11px] text-muted">{editedBio.split(' ').length} words</span>
                </div>
                <textarea value={editedBio} onChange={e => setEditedBio(e.target.value)} rows={4}
                  className="w-full bg-bg border border-violet/30 rounded-sm px-4 py-3 text-[14px] text-ink outline-none resize-none leading-[1.7] focus:border-violet/60 transition-all duration-200" />
              </div>
              {result.suggestedTags.length > 0 && (
                <div>
                  <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-2">Detected Languages / Tags</label>
                  <div className="flex flex-wrap gap-2">{result.suggestedTags.map((t: string) => <span key={t} className="tag text-[12px]">{t}</span>)}</div>
                </div>
              )}
              <button onClick={() => { onApply(editedBio, result.suggestedTags); onClose() }}
                className="w-full font-display font-semibold text-[14px] py-3.5 rounded-sm bg-ink text-bg transition-all duration-200 hover:opacity-90">
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
// MEMBER EDITOR
// ═══════════════════════════════════════════════════════════
function MemberEditor({ member, password, onSaved }: { member: MemberRow; password: string; onSaved: (m: MemberRow) => void }) {
  const [form, setForm] = useState<MemberRow>({ ...member })
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSummarize, setShowSummarize] = useState(false)
  const [photoUploading, setPhotoUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const accent = ACCENTS[member.id] ?? '#ededed'

  const set = (key: keyof MemberRow, val: any) => setForm(prev => ({ ...prev, [key]: val }))
  const addTag = () => { const t = tagInput.trim(); if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]); setTagInput('') }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('Save failed')
      onSaved(await res.json())
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { alert('Failed to save.') }
    finally { setSaving(false) }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPhotoUploading(true)
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const ext = file.name.split('.').pop()
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
    set('tags', [...new Set([...form.tags, ...tags])])
  }

  return (
    <>
      <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden transition-all duration-200 hover:border-white/10">
        <div className="h-1 w-full" style={{ background: accent }} />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-full border-2 border-white/10 overflow-hidden flex items-center justify-center font-display font-bold text-[18px]"
                   style={{ background: `${accent}20`, color: accent }}>
                {form.photo_url ? <img src={form.photo_url} alt={form.name} className="w-full h-full object-cover" /> : form.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
              </div>
              <button onClick={() => fileInputRef.current?.click()} disabled={photoUploading}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-surface2 border border-white/10 text-[11px] flex items-center justify-center hover:bg-white/10 transition-colors"
                title="Upload photo">{photoUploading ? '⏳' : '📷'}</button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display font-bold text-[15px] truncate">{form.name}</div>
              <div className="text-[12px] text-muted truncate">{form.role}</div>
            </div>
            <button onClick={() => setShowSummarize(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-all duration-200 flex-shrink-0">
              <span>🤖</span> AI Bio
            </button>
          </div>
          <div className="space-y-4">
            {(['name','short_name','role'] as const).map(key => (
              <div key={key}>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">
                  {key === 'short_name' ? 'Short Name' : key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                <input value={(form as any)[key]} onChange={e => set(key, e.target.value)}
                  className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none transition-all duration-200 focus:border-violet/40" />
              </div>
            ))}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-medium tracking-[0.08em] uppercase text-muted">Bio</label>
                <span className="text-[11px] text-muted">{form.bio.split(' ').filter(Boolean).length} words</span>
              </div>
              <textarea value={form.bio} onChange={e => set('bio', e.target.value)} rows={3}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.65] focus:border-violet/40 transition-all duration-200" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Tags / Skills</label>
              <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                {form.tags.map(t => (
                  <span key={t} className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[rgba(255,255,255,0.08)] text-violet-soft border border-[rgba(255,255,255,0.12)]">
                    {t}<button onClick={() => set('tags', form.tags.filter(x => x !== t))} className="hover:text-red transition-colors ml-0.5">×</button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag() } }}
                  placeholder="Add tag, press Enter"
                  className="flex-1 bg-bg border border-white/[0.07] rounded-sm px-3 py-2 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
                <button onClick={addTag} className="px-3 py-2 bg-surface2 border border-white/[0.07] rounded-sm text-[13px] text-muted hover:text-ink transition-colors">+</button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {(['github','linkedin'] as const).map(key => (
                <div key={key}>
                  <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                  <input value={form[key]} onChange={e => set(key, e.target.value)}
                    className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">CV URL</label>
                <input value={form.cv_url ?? ''} onChange={e => set('cv_url', e.target.value || null)}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/30" />
              </div>
              <div>
                <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Portfolio URL</label>
                <input value={form.portfolio_url ?? ''} onChange={e => set('portfolio_url', e.target.value || null)}
                  placeholder="https://yourportfolio.com"
                  className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/30" />
              </div>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className={clsx('mt-5 w-full font-display font-semibold text-[13px] py-3 rounded-sm transition-all duration-200',
              saved ? 'bg-white/10 text-ink border border-white/25' : 'bg-ink text-bg hover:opacity-90 disabled:opacity-50')}>
            {saving ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : saved ? '✓ Saved!' : 'Save changes'}
          </button>
        </div>
      </div>
      {showSummarize && <SummarizeModal member={form} password={password} onApply={handleAISummarize} onClose={() => setShowSummarize(false)} />}
    </>
  )
}

// ═══════════════════════════════════════════════════════════
// PROJECT EDITOR
// ═══════════════════════════════════════════════════════════
function ProjectEditor({ project, password, onSaved, onDeleted }: {
  project: ProjectRow; password: string
  onSaved: (p: ProjectRow) => void; onDeleted: (id: string) => void
}) {
  const [form, setForm] = useState<ProjectRow>({ ...project })
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [previewUploading, setPreviewUploading] = useState(false)
  const previewInputRef = useRef<HTMLInputElement>(null)

  const set = (key: keyof ProjectRow, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const handlePreviewUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setPreviewUploading(true)
    const { createClient } = await import('@supabase/supabase-js')
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
    const ext = file.name.split('.').pop()
    const path = `project-${form.id}-${Date.now()}.${ext}`
    const { error } = await sb.storage.from('project-previews').upload(path, file, { upsert: true })
    if (!error) {
      const { data } = sb.storage.from('project-previews').getPublicUrl(path)
      set('preview_url', data.publicUrl)
    }
    setPreviewUploading(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      onSaved(await res.json())
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { alert('Save failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete project "${form.name}"? This cannot be undone.`)) return
    setDeleting(true)
    try {
      await fetch('/api/projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ id: form.id }),
      })
      onDeleted(form.id)
    } catch { alert('Delete failed.') }
    finally { setDeleting(false) }
  }

  const field = (key: keyof ProjectRow, label: string, type = 'text', rows = 0) => (
    <div key={key as string}>
      <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">{label}</label>
      {rows > 0
        ? <textarea value={(form as any)[key] ?? ''} onChange={e => set(key, e.target.value)} rows={rows}
            className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.6] focus:border-violet/40 transition-all duration-200" />
        : <input type={type} value={(form as any)[key] ?? ''} onChange={e => set(key, e.target.value)}
            className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none transition-all duration-200 focus:border-violet/40" />
      }
    </div>
  )

  return (
    <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden transition-all duration-200">
      {/* Compact header */}
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left">
        <div className="w-12 h-9 rounded-sm overflow-hidden flex-shrink-0 flex items-center justify-center text-[24px]"
             style={form.preview_url ? undefined : { background: `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})` }}>
          {form.preview_url
            ? <img src={form.preview_url} alt="" className="w-full h-full object-cover object-top" />
            : form.emoji
          }
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[15px] truncate">{form.name}</div>
          <div className="text-[12px] text-muted truncate">{form.type} · {form.year}</div>
        </div>
        <span className={clsx('text-[10px] font-semibold tracking-[0.06em] uppercase px-2.5 py-1 rounded-full',
          form.status === 'live' ? 'bg-white/15 text-ink' :
          form.status === 'shipped' ? 'bg-white/10 text-violet-soft' :
          form.status === 'wip' ? 'bg-white/07 text-violet-soft' : 'bg-surface2 text-muted')}>
          {form.status}
        </span>
        <span className="text-muted text-[18px]">{expanded ? '−' : '+'}</span>
      </button>

      {/* Expanded editor */}
      {expanded && (
        <div className="border-t border-white/[0.05] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {field('name', 'Name')}
            {field('type', 'Type')}
            {field('emoji', 'Emoji')}
            {field('year', 'Year')}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40">
                {['live','shipped','wip','portfolio'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Categories (comma-sep: web, mobile, ar, data, design)</label>
            <input value={form.categories.join(', ')} onChange={e => set('categories', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Stack (comma-sep)</label>
            <input value={form.stack.join(', ')} onChange={e => set('stack', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Members (comma-sep IDs: 0,1,2,3,4)</label>
            <input value={form.members.join(', ')} onChange={e => set('members', e.target.value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n)))}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
          </div>
          {field('description', 'Short Description', 'text', 2)}
          {field('overview', 'Overview', 'text', 3)}
          {field('challenge', 'Challenge', 'text', 2)}
          {field('solution', 'Solution', 'text', 2)}
          {field('role', 'Role')}
          {field('link', 'Live Link (optional)')}
          {/* Preview screenshot */}
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-2">Project Preview Screenshot</label>
            <div className="flex items-start gap-3">
              {form.preview_url
                ? <div className="relative w-32 h-20 rounded-sm overflow-hidden border border-white/10 flex-shrink-0 group">
                    <img src={form.preview_url} alt="preview" className="w-full h-full object-cover object-top" />
                    <button onClick={() => set('preview_url', null)}
                      className="absolute inset-0 bg-black/60 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      Hapus
                    </button>
                  </div>
                : <div className="w-32 h-20 rounded-sm border border-dashed border-white/20 flex items-center justify-center text-[11px] text-muted flex-shrink-0">
                    No preview
                  </div>
              }
              <div className="flex-1">
                <button onClick={() => previewInputRef.current?.click()} disabled={previewUploading}
                  className="w-full px-4 py-2.5 bg-surface2 border border-white/[0.09] rounded-sm text-[13px] text-muted hover:text-ink hover:border-white/20 transition-all duration-200 disabled:opacity-50">
                  {previewUploading ? '⏳ Uploading...' : '📸 Upload screenshot'}
                </button>
                <p className="text-[11px] text-muted/60 mt-1.5">Upload screenshot website/app. Akan tampil di kartu project.</p>
                <input ref={previewInputRef} type="file" accept="image/*" className="hidden" onChange={handlePreviewUpload} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {field('gradient_from', 'Gradient From (hex)')}
            {field('gradient_to', 'Gradient To (hex)')}
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)}
              className="w-4 h-4 rounded" />
            <span className="text-[13px] text-muted">Featured project</span>
          </label>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className={clsx('flex-1 font-display font-semibold text-[13px] py-2.5 rounded-sm transition-all duration-200',
                saved ? 'bg-white/10 text-ink border border-white/25' : 'bg-ink text-bg hover:opacity-90 disabled:opacity-50')}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save project'}
            </button>
            <button onClick={handleDelete} disabled={deleting}
              className="px-4 py-2.5 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red hover:bg-red/20 transition-colors disabled:opacity-50">
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// NEW PROJECT MODAL
// ═══════════════════════════════════════════════════════════
function NewProjectModal({ password, onCreated, onClose }: {
  password: string
  onCreated: (p: ProjectRow) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    id: '',
    name: '',
    type: 'Web App',
    emoji: '🚀',
    year: new Date().getFullYear().toString(),
    status: 'wip',
    categories: '',
    stack: '',
    description: '',
    gradient_from: '#8b5cf6',
    gradient_to: '#06b6d4',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleCreate = async () => {
    if (!form.id.trim() || !form.name.trim()) { setError('ID dan Name wajib diisi.'); return }
    if (!/^[a-z0-9-]+$/.test(form.id.trim())) { setError('ID hanya boleh huruf kecil, angka, dan tanda -'); return }
    setSaving(true); setError('')
    try {
      const payload: Partial<ProjectRow> = {
        id: form.id.trim(),
        name: form.name.trim(),
        type: form.type,
        emoji: form.emoji,
        year: form.year,
        status: form.status,
        categories: form.categories.split(',').map(s => s.trim()).filter(Boolean),
        stack: form.stack.split(',').map(s => s.trim()).filter(Boolean),
        description: form.description,
        gradient_from: form.gradient_from,
        gradient_to: form.gradient_to,
        featured: false,
        members: [],
        overview: '',
        challenge: '',
        solution: '',
        role: '',
        link: null,
        preview_url: null,
        sort_order: 99,
      }
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      onCreated(data)
      onClose()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-white/[0.09] rounded-[20px] w-full max-w-[520px] max-h-[90vh] overflow-y-auto [scrollbar-width:none]">
        <div className="flex items-center justify-between p-7 pb-0">
          <div>
            <h3 className="font-display font-bold text-[20px]">New Project</h3>
            <p className="text-[13px] text-muted mt-0.5">Isi field wajib, lanjutkan edit setelah dibuat.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface2 border border-white/[0.05] text-muted text-xl flex items-center justify-center hover:text-ink hover:bg-white/[0.09] transition-colors">×</button>
        </div>
        <div className="p-7 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">ID <span className="text-red">*</span></label>
              <input value={form.id} onChange={e => set('id', e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="my-project-id"
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
              <p className="text-[10px] text-muted/60 mt-1">Hanya huruf kecil & tanda -</p>
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Name <span className="text-red">*</span></label>
              <input value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="Nama project"
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Emoji</label>
              <input value={form.emoji} onChange={e => set('emoji', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[18px] text-center outline-none focus:border-violet/40" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Year</label>
              <input value={form.year} onChange={e => set('year', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40">
                {['live','shipped','wip','portfolio'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Type</label>
            <input value={form.type} onChange={e => set('type', e.target.value)}
              placeholder="Web App, Mobile, etc."
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Categories (comma-sep)</label>
            <input value={form.categories} onChange={e => set('categories', e.target.value)}
              placeholder="web, mobile, ar, data, design"
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Stack (comma-sep)</label>
            <input value={form.stack} onChange={e => set('stack', e.target.value)}
              placeholder="Next.js, TypeScript, Supabase"
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Short Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              placeholder="Deskripsi singkat project..."
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.6] focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Gradient From</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.gradient_from} onChange={e => set('gradient_from', e.target.value)}
                  className="w-10 h-10 rounded-sm border border-white/[0.07] bg-bg cursor-pointer" />
                <input value={form.gradient_from} onChange={e => set('gradient_from', e.target.value)}
                  className="flex-1 bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Gradient To</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.gradient_to} onChange={e => set('gradient_to', e.target.value)}
                  className="w-10 h-10 rounded-sm border border-white/[0.07] bg-bg cursor-pointer" />
                <input value={form.gradient_to} onChange={e => set('gradient_to', e.target.value)}
                  className="flex-1 bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
              </div>
            </div>
          </div>
          {/* Preview gradient */}
          <div className="h-10 rounded-sm" style={{ background: `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})` }} />

          {error && <div className="p-3 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 font-display font-semibold text-[13px] py-3 rounded-sm border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 font-display font-semibold text-[13px] py-3 rounded-sm bg-ink text-bg transition-all duration-200 hover:opacity-90 disabled:opacity-50">
              {saving ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</span> : '+ Create Project'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// PRICING EDITOR
// ═══════════════════════════════════════════════════════════
function PricingEditor({ plan, password, onSaved, onDeleted }: {
  plan: PricingRow; password: string
  onSaved: (p: PricingRow) => void; onDeleted: (id: string) => void
}) {
  const [form, setForm] = useState<PricingRow>({ ...plan })
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof PricingRow, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/pricing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      onSaved(await res.json())
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { alert('Save failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete pricing plan "${form.name}"?`)) return
    await fetch('/api/pricing', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
      body: JSON.stringify({ id: form.id }),
    })
    onDeleted(form.id)
  }

  return (
    <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[15px]">{form.name}</div>
          <div className="text-[12px] text-muted">{form.price}</div>
        </div>
        {form.featured && <span className="text-[10px] font-semibold tracking-[0.08em] uppercase px-2.5 py-1 rounded-full bg-white/10 border border-white/12 text-ink">Popular</span>}
        <span className="text-muted text-[18px]">{expanded ? '−' : '+'}</span>
      </button>

      {expanded && (
        <div className="border-t border-white/[0.05] p-5 space-y-4">
          {(['name','price','tagline'] as const).map(key => (
            <div key={key}>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
              <input value={form[key]} onChange={e => set(key, e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
          ))}
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Features (satu per baris)</label>
            <textarea value={form.features.join('\n')} onChange={e => set('features', e.target.value.split('\n').map(s => s.trim()).filter(Boolean))} rows={4}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.7] focus:border-violet/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
            <label className="flex items-end gap-3 cursor-pointer pb-2.5">
              <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} className="w-4 h-4 rounded" />
              <span className="text-[13px] text-muted">Featured (Popular)</span>
            </label>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className={clsx('flex-1 font-display font-semibold text-[13px] py-2.5 rounded-sm transition-all duration-200',
                saved ? 'bg-white/10 text-ink border border-white/25' : 'bg-ink text-bg hover:opacity-90 disabled:opacity-50')}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save plan'}
            </button>
            <button onClick={handleDelete} className="px-4 py-2.5 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red hover:bg-red/20 transition-colors">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// TIMELINE EDITOR
// ═══════════════════════════════════════════════════════════
function TimelineEditor({ entry, password, onSaved, onDeleted }: {
  entry: TimelineRow; password: string
  onSaved: (e: TimelineRow) => void; onDeleted: (id: string) => void
}) {
  const [form, setForm] = useState<TimelineRow>({ ...entry })
  const [expanded, setExpanded] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (key: keyof TimelineRow, val: any) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/timeline', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      onSaved(await res.json())
      setSaved(true); setTimeout(() => setSaved(false), 2000)
    } catch { alert('Save failed.') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete timeline entry "${form.title}"?`)) return
    await fetch('/api/timeline', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
      body: JSON.stringify({ id: form.id }),
    })
    onDeleted(form.id)
  }

  const TYPE_LABELS: Record<string, string> = { project: '📦 Project', award: '🏆 Award', learning: '📚 Learning', milestone: '🎯 Milestone' }

  return (
    <div className="bg-surface border border-white/[0.05] rounded-card overflow-hidden">
      <button onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-white/[0.03] transition-colors text-left">
        <div className="flex-1 min-w-0">
          <div className="font-display font-semibold text-[14px] truncate">{form.title}</div>
          <div className="text-[12px] text-muted">{form.month} · {TYPE_LABELS[form.type] ?? form.type}</div>
        </div>
        <span className="text-muted text-[18px]">{expanded ? '−' : '+'}</span>
      </button>
      {expanded && (
        <div className="border-t border-white/[0.05] p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Year</label>
              <input value={form.year} onChange={e => set('year', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Month (e.g. Jun 2025)</label>
              <input value={form.month} onChange={e => set('month', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Type</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40">
              {['project','award','learning','milestone'].map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Title</label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.6] focus:border-violet/40" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Member ID (-1 = team)</label>
              <input type="number" value={form.member_id} onChange={e => set('member_id', Number(e.target.value))}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', Number(e.target.value))}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving}
              className={clsx('flex-1 font-display font-semibold text-[13px] py-2.5 rounded-sm transition-all duration-200',
                saved ? 'bg-white/10 text-ink border border-white/25' : 'bg-ink text-bg hover:opacity-90 disabled:opacity-50')}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save entry'}
            </button>
            <button onClick={handleDelete} className="px-4 py-2.5 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red hover:bg-red/20 transition-colors">Delete</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// NEW TIMELINE MODAL
// ═══════════════════════════════════════════════════════════
function NewTimelineModal({ password, onCreated, onClose }: {
  password: string
  onCreated: (e: TimelineRow) => void
  onClose: () => void
}) {
  const now = new Date()
  const defaultMonth = now.toLocaleString('en-US', { month: 'short' }) + ' ' + now.getFullYear()

  const [form, setForm] = useState({
    title: '',
    year: now.getFullYear().toString(),
    month: defaultMonth,
    type: 'project',
    description: '',
    member_id: '-1',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (key: string, val: string) => setForm(prev => ({ ...prev, [key]: val }))

  const handleCreate = async () => {
    if (!form.title.trim()) { setError('Title wajib diisi.'); return }
    setSaving(true); setError('')
    try {
      const id = `t-${Date.now()}`
      const payload: Partial<TimelineRow> = {
        id,
        title: form.title.trim(),
        year: form.year,
        month: form.month,
        type: form.type,
        description: form.description,
        member_id: Number(form.member_id),
        sort_order: 0,
      }
      const res = await fetch('/api/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Create failed')
      onCreated(data)
      onClose()
    } catch (err: any) { setError(err.message) }
    finally { setSaving(false) }
  }

  const TYPE_OPTIONS = [
    { value: 'project',   label: '📦 Project' },
    { value: 'milestone', label: '🎯 Milestone' },
    { value: 'award',     label: '🏆 Award' },
    { value: 'learning',  label: '📚 Learning' },
  ]

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-6 bg-bg/90 backdrop-blur-xl"
         onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-surface border border-white/[0.09] rounded-[20px] w-full max-w-[480px]">
        <div className="flex items-center justify-between p-7 pb-0">
          <div>
            <h3 className="font-display font-bold text-[20px]">New Timeline Entry</h3>
            <p className="text-[13px] text-muted mt-0.5">Tambah milestone, project, atau award baru.</p>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-surface2 border border-white/[0.05] text-muted text-xl flex items-center justify-center hover:text-ink hover:bg-white/[0.09] transition-colors">×</button>
        </div>
        <div className="p-7 space-y-4">
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Title <span className="text-red">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="Nama event / project / award..."
              autoFocus
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-2">Type</label>
            <div className="grid grid-cols-2 gap-2">
              {TYPE_OPTIONS.map(opt => (
                <button key={opt.value} type="button" onClick={() => set('type', opt.value)}
                  className={clsx('px-3 py-2.5 rounded-sm text-[13px] font-medium border transition-all duration-150 text-left',
                    form.type === opt.value
                      ? 'bg-ink text-bg border-ink'
                      : 'bg-bg border-white/[0.07] text-muted hover:text-ink hover:border-white/20')}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Year</label>
              <input value={form.year} onChange={e => set('year', e.target.value)}
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40" />
            </div>
            <div>
              <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Month</label>
              <input value={form.month} onChange={e => set('month', e.target.value)}
                placeholder="Jun 2025"
                className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40 placeholder:text-muted/40" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              placeholder="Deskripsi singkat..."
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none resize-none leading-[1.6] focus:border-violet/40 placeholder:text-muted/40" />
          </div>
          <div>
            <label className="block text-[11px] font-medium tracking-[0.08em] uppercase text-muted mb-1.5">Member</label>
            <select value={form.member_id} onChange={e => set('member_id', e.target.value)}
              className="w-full bg-bg border border-white/[0.07] rounded-sm px-3 py-2.5 text-[13px] text-ink outline-none focus:border-violet/40">
              <option value="-1">— Tim (semua)</option>
              <option value="0">Member 0 (Bhoja)</option>
              <option value="1">Member 1</option>
              <option value="2">Member 2</option>
              <option value="3">Member 3</option>
              <option value="4">Member 4</option>
            </select>
          </div>

          {error && <div className="p-3 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}

          <div className="flex gap-3 pt-1">
            <button onClick={onClose} className="flex-1 font-display font-semibold text-[13px] py-3 rounded-sm border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-all duration-200">
              Cancel
            </button>
            <button onClick={handleCreate} disabled={saving}
              className="flex-1 font-display font-semibold text-[13px] py-3 rounded-sm bg-ink text-bg transition-all duration-200 hover:opacity-90 disabled:opacity-50">
              {saving ? <span className="flex items-center justify-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</span> : '+ Add Entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════
// MAIN DASHBOARD
// ═══════════════════════════════════════════════════════════
export default function DashboardClient() {
  const [password, setPassword] = useState<string | null>(null)
  const [section, setSection] = useState<Section>('members')

  // Members
  const [members, setMembers] = useState<MemberRow[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<number | 'all'>('all')

  // Projects
  const [projects, setProjects] = useState<ProjectRow[]>([])
  const [projectsLoaded, setProjectsLoaded] = useState(false)
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [showNewProject, setShowNewProject] = useState(false)

  // Pricing
  const [pricing, setPricing] = useState<PricingRow[]>([])
  const [pricingLoaded, setPricingLoaded] = useState(false)
  const [pricingLoading, setPricingLoading] = useState(false)

  // Timeline
  const [timeline, setTimeline] = useState<TimelineRow[]>([])
  const [timelineLoaded, setTimelineLoaded] = useState(false)
  const [timelineLoading, setTimelineLoading] = useState(false)
  const [showNewTimeline, setShowNewTimeline] = useState(false)

  // Inquiries
  const [inquiries, setInquiries] = useState<ContactSubmission[]>([])
  const [inquiriesLoaded, setInquiriesLoaded] = useState(false)
  const [inquiriesLoading, setInquiriesLoading] = useState(false)

  // Restore password from session
  useEffect(() => {
    const cached = sessionStorage.getItem('naty_dashboard_pwd')
    if (cached) setPassword(cached)
  }, [])

  const handleUnlock = useCallback(async (pwd: string) => {
    sessionStorage.setItem('naty_dashboard_pwd', pwd)
    setPassword(pwd)
  }, [])

  // Fetch members when password is set
  useEffect(() => {
    if (!password) return
    setMembersLoading(true)
    fetch('/api/members', { headers: { 'x-dashboard-password': password } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setMembers(d) })
      .finally(() => setMembersLoading(false))
  }, [password])

  // Lazy-load other sections on demand
  useEffect(() => {
    if (!password) return
    if (section === 'projects' && !projectsLoaded) {
      setProjectsLoading(true)
      fetch('/api/projects', { headers: { 'x-dashboard-password': password } })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setProjects(d); setProjectsLoaded(true) })
        .finally(() => setProjectsLoading(false))
    }
    if (section === 'pricing' && !pricingLoaded) {
      setPricingLoading(true)
      fetch('/api/pricing', { headers: { 'x-dashboard-password': password } })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setPricing(d); setPricingLoaded(true) })
        .finally(() => setPricingLoading(false))
    }
    if (section === 'timeline' && !timelineLoaded) {
      setTimelineLoading(true)
      fetch('/api/timeline', { headers: { 'x-dashboard-password': password } })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setTimeline(d); setTimelineLoaded(true) })
        .finally(() => setTimelineLoading(false))
    }
    if (section === 'inquiries' && !inquiriesLoaded) {
      setInquiriesLoading(true)
      fetch('/api/contact', { headers: { 'x-dashboard-password': password } })
        .then(r => r.json()).then(d => { if (Array.isArray(d)) setInquiries(d); setInquiriesLoaded(true) })
        .finally(() => setInquiriesLoading(false))
    }
  }, [section, password])

  const handleLogout = () => {
    sessionStorage.removeItem('naty_dashboard_pwd')
    setPassword(null); setMembers([])
  }

  const markRead = async (id: string, is_read: boolean) => {
    await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password! },
      body: JSON.stringify({ id, is_read }),
    })
    setInquiries(prev => prev.map(i => i.id === id ? { ...i, is_read } : i))
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    await fetch('/api/contact', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password! },
      body: JSON.stringify({ id }),
    })
    setInquiries(prev => prev.filter(i => i.id !== id))
  }

  if (!password) return <PasswordGate onUnlock={handleUnlock} />

  const NAV_ITEMS: { key: Section; label: string; count?: number }[] = [
    { key: 'members',   label: 'Members',   count: members.length },
    { key: 'projects',  label: 'Projects',  count: projectsLoaded ? projects.length : undefined },
    { key: 'pricing',   label: 'Pricing',   count: pricingLoaded ? pricing.length : undefined },
    { key: 'timeline',  label: 'Timeline',  count: timelineLoaded ? timeline.length : undefined },
    { key: 'inquiries', label: 'Inquiries', count: inquiriesLoaded ? inquiries.filter(i => !i.is_read).length : undefined },
  ]

  const displayedMembers = activeTab === 'all' ? members : members.filter(m => m.id === activeTab)

  return (
    <div className="min-h-screen bg-bg">
      {/* Nav */}
      <div className="sticky top-0 z-50 bg-bg/90 backdrop-blur-xl border-b border-white/[0.05]">
        <div className="max-w-[1200px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-display font-bold text-[18px]">NAT<span className="text-violet">Y</span></span>
            <div className="flex gap-1">
              {NAV_ITEMS.map(({ key, label, count }) => (
                <button key={key} onClick={() => setSection(key)}
                  className={clsx('flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full transition-all duration-200',
                    section === key ? 'bg-ink text-bg' : 'text-muted hover:text-ink hover:bg-white/[0.06]')}>
                  {label}
                  {count !== undefined && count > 0 && (
                    <span className={clsx('text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center',
                      section === key ? 'bg-white/20' : 'bg-white/10')}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-[13px] text-muted hover:text-ink transition-colors">View site →</a>
            <button onClick={handleLogout} className="text-[13px] text-muted hover:text-red transition-colors">Logout</button>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 py-10">

        {/* ── MEMBERS ── */}
        {section === 'members' && (
          <>
            <div className="mb-8">
              <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Member Profiles</h1>
              <p className="text-[14px] text-muted">Edit team member information. Changes save to Supabase and appear live on the portfolio.</p>
            </div>
            <div className="flex gap-2 flex-wrap mb-8">
              <button onClick={() => setActiveTab('all')} className={clsx('font-display text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200',
                activeTab === 'all' ? 'bg-ink border-ink text-bg' : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20')}>
                All members
              </button>
              {members.map(m => (
                <button key={m.id} onClick={() => setActiveTab(m.id)}
                  className={clsx('font-display text-[13px] font-medium px-4 py-1.5 rounded-full border transition-all duration-200',
                    activeTab === m.id ? 'text-bg border-transparent' : 'bg-transparent border-white/[0.09] text-muted hover:text-ink hover:border-white/20')}
                  style={activeTab === m.id ? { background: ACCENTS[m.id], borderColor: ACCENTS[m.id] } : {}}>
                  {m.short_name}
                </button>
              ))}
            </div>
            {membersLoading
              ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">{[...Array(5)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[480px] animate-pulse" />)}</div>
              : <div className={clsx('grid gap-5', activeTab === 'all' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-[560px]')}>
                  {displayedMembers.map(m => (
                    <MemberEditor key={m.id} member={m} password={password}
                      onSaved={updated => setMembers(prev => prev.map(p => p.id === updated.id ? updated : p))} />
                  ))}
                </div>
            }
            <div className="mt-12 p-5 bg-surface border border-white/[0.05] rounded-card text-[13px] text-muted flex flex-col sm:flex-row gap-4">
              <div className="flex-1"><div className="font-medium text-ink mb-1">🤖 AI Bio Generation</div>Click <strong className="text-ink">AI Bio</strong> on any card → enter GitHub URL → AI generates a professional bio.</div>
              <div className="flex-1"><div className="font-medium text-ink mb-1">💾 Auto-save to Supabase</div>Click <strong className="text-ink">Save changes</strong> to persist. Landing page reads from Supabase — changes appear within 60s.</div>
            </div>
          </>
        )}

        {/* ── PROJECTS ── */}
        {section === 'projects' && (
          <>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Projects</h1>
                <p className="text-[14px] text-muted">Edit project data. Changes appear on the landing page carousel and /works page.</p>
              </div>
              <button onClick={() => setShowNewProject(true)}
                className="flex-shrink-0 flex items-center gap-2 font-display font-semibold text-[13px] px-4 py-2.5 rounded-sm bg-ink text-bg hover:opacity-90 transition-all duration-200">
                + New Project
              </button>
            </div>
            {projectsLoading
              ? <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[60px] animate-pulse" />)}</div>
              : <div className="space-y-3">
                  {projects.map(p => (
                    <ProjectEditor key={p.id} project={p} password={password}
                      onSaved={updated => setProjects(prev => prev.map(x => x.id === updated.id ? updated : x))}
                      onDeleted={id => setProjects(prev => prev.filter(x => x.id !== id))} />
                  ))}
                  {projects.length === 0 && (
                    <div className="text-center py-20 text-muted">
                      <div className="text-[40px] mb-4">📂</div>
                      <p className="text-[15px] font-medium text-ink mb-1">Belum ada project</p>
                      <p className="text-[13px] mb-6">Tambah project pertama kamu dengan tombol di atas.</p>
                      <button onClick={() => setShowNewProject(true)}
                        className="font-display font-semibold text-[13px] px-5 py-2.5 rounded-sm bg-ink text-bg hover:opacity-90 transition-all duration-200">
                        + New Project
                      </button>
                    </div>
                  )}
                </div>
            }
            {showNewProject && (
              <NewProjectModal
                password={password}
                onCreated={p => setProjects(prev => [p, ...prev])}
                onClose={() => setShowNewProject(false)}
              />
            )}
          </>
        )}

        {/* ── PRICING ── */}
        {section === 'pricing' && (
          <>
            <div className="mb-8">
              <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Pricing Plans</h1>
              <p className="text-[14px] text-muted">Edit harga dan fitur tiap paket. Perubahan langsung muncul di landing page.</p>
            </div>
            {pricingLoading
              ? <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[60px] animate-pulse" />)}</div>
              : <div className="space-y-3">
                  {pricing.map(p => (
                    <PricingEditor key={p.id} plan={p} password={password}
                      onSaved={updated => setPricing(prev => prev.map(x => x.id === updated.id ? updated : x))}
                      onDeleted={id => setPricing(prev => prev.filter(x => x.id !== id))} />
                  ))}
                  {pricing.length === 0 && <div className="text-center py-16 text-muted text-[14px]">Belum ada pricing di Supabase. Jalankan SQL setup dulu.</div>}
                </div>
            }
          </>
        )}

        {/* ── TIMELINE ── */}
        {section === 'timeline' && (
          <>
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Timeline</h1>
                <p className="text-[14px] text-muted">Kelola milestone, project, dan award tim. Muncul di halaman /timeline.</p>
              </div>
              <button onClick={() => setShowNewTimeline(true)}
                className="flex-shrink-0 flex items-center gap-2 font-display font-semibold text-[13px] px-4 py-2.5 rounded-sm bg-ink text-bg hover:opacity-90 transition-all duration-200">
                + New Entry
              </button>
            </div>
            {timelineLoading
              ? <div className="space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[60px] animate-pulse" />)}</div>
              : <div className="space-y-3">
                  {timeline.map(e => (
                    <TimelineEditor key={e.id} entry={e} password={password}
                      onSaved={updated => setTimeline(prev => prev.map(x => x.id === updated.id ? updated : x))}
                      onDeleted={id => setTimeline(prev => prev.filter(x => x.id !== id))} />
                  ))}
                  {timeline.length === 0 && (
                    <div className="text-center py-20 text-muted">
                      <div className="text-[40px] mb-4">🗓</div>
                      <p className="text-[15px] font-medium text-ink mb-1">Belum ada timeline</p>
                      <p className="text-[13px] mb-6">Tambah entry pertama atau jalankan SQL setup untuk import data awal.</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => setShowNewTimeline(true)}
                          className="font-display font-semibold text-[13px] px-5 py-2.5 rounded-sm bg-ink text-bg hover:opacity-90 transition-all duration-200">
                          + New Entry
                        </button>
                        <a href="https://supabase.com/dashboard/project/wfkicnqmkpzhngkjifon/sql/new"
                          target="_blank" rel="noopener noreferrer"
                          className="font-display font-semibold text-[13px] px-5 py-2.5 rounded-sm border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-all duration-200">
                          Buka SQL Editor →
                        </a>
                      </div>
                    </div>
                  )}
                </div>
            }
            {showNewTimeline && (
              <NewTimelineModal
                password={password}
                onCreated={e => setTimeline(prev => [e, ...prev])}
                onClose={() => setShowNewTimeline(false)}
              />
            )}
          </>
        )}

        {/* ── INQUIRIES ── */}
        {section === 'inquiries' && (
          <>
            <div className="mb-8">
              <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Inquiries</h1>
              <p className="text-[14px] text-muted">Pesan masuk dari form contact. Klik untuk tandai sudah dibaca.</p>
            </div>
            {inquiriesLoading
              ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[80px] animate-pulse" />)}</div>
              : inquiries.length === 0
                ? <div className="text-center py-16 text-muted text-[14px]">Belum ada pesan masuk.</div>
                : <div className="space-y-3">
                    {inquiries.map(inq => (
                      <div key={inq.id} className={clsx('bg-surface border rounded-card p-5 transition-all duration-200',
                        inq.is_read ? 'border-white/[0.05] opacity-70' : 'border-violet/20')}>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              {!inq.is_read && <span className="w-2 h-2 rounded-full bg-violet flex-shrink-0" />}
                              <span className="font-display font-semibold text-[15px]">{inq.name}</span>
                              <span className="text-[12px] text-muted">{inq.email}</span>
                              {inq.company && <span className="text-[12px] text-muted">· {inq.company}</span>}
                            </div>
                            {(inq.service || inq.budget) && (
                              <div className="flex gap-2 mb-2">
                                {inq.service && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-violet-soft">{inq.service}</span>}
                                {inq.budget && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{inq.budget}</span>}
                              </div>
                            )}
                            <p className="text-[13px] text-muted leading-[1.65] line-clamp-3">{inq.message}</p>
                            <p className="text-[11px] text-muted/50 mt-2">{new Date(inq.created_at).toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex flex-col gap-2 flex-shrink-0">
                            <button onClick={() => markRead(inq.id, !inq.is_read)}
                              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-colors whitespace-nowrap">
                              {inq.is_read ? 'Tandai belum dibaca' : '✓ Tandai dibaca'}
                            </button>
                            <button onClick={() => deleteInquiry(inq.id)}
                              className="text-[12px] font-medium px-3 py-1.5 rounded-full border border-red/20 text-red hover:bg-red/10 transition-colors">
                              Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
            }
          </>
        )}
      </div>
    </div>
  )
}
