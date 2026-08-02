'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { ContactSubmission, MemberRow } from '@/lib/supabase'

interface Props {
  inquiries: ContactSubmission[]
  loading: boolean
  password: string
  members: MemberRow[]
  isSessionAuth: boolean
  isAdmin: boolean
  onUpdated: (updated: ContactSubmission) => void
  onDeleted: (id: string) => void
  onEngagementCreated: () => void
}

const STATUS_LABEL: Record<ContactSubmission['status'], string> = {
  BARU: 'Baru',
  DIKUALIFIKASI: 'Dikualifikasi',
  DITUTUP: 'Ditutup',
  JADI_ENGAGEMENT: 'Jadi Engagement',
}

// Extracted from DashboardClient's old inline Inquiries block (per
// CLAUDE.md §10 — new sections go in their own file) and extended
// with the M3 lead pipeline: claim, admin override, convert to
// engagement.
export default function LeadsSection({
  inquiries, loading, password, members, isSessionAuth, isAdmin,
  onUpdated, onDeleted, onEngagementCreated,
}: Props) {
  const [convertFor, setConvertFor] = useState<string | null>(null)
  const [value, setValue] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const findMember = (id: number | null) => members.find(m => m.id === id)

  const markRead = async (id: string, is_read: boolean) => {
    const res = await fetch('/api/contact', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
      body: JSON.stringify({ id, is_read }),
    })
    if (res.ok) onUpdated(await res.json())
  }

  const deleteInquiry = async (id: string) => {
    if (!confirm('Delete this inquiry?')) return
    await fetch('/api/contact', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
      body: JSON.stringify({ id }),
    })
    onDeleted(id)
  }

  const claimLead = async (id: string) => {
    setBusyId(id); setError('')
    try {
      const res = await fetch('/api/leads/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ submissionId: id }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal klaim lead'); return }
      onUpdated(data)
    } finally {
      setBusyId(null)
    }
  }

  const overrideFinder = async (id: string, finderId: number | null) => {
    setBusyId(id); setError('')
    try {
      const res = await fetch('/api/leads/claim', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ submissionId: id, finderId }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal ubah finder'); return }
      onUpdated(data)
    } finally {
      setBusyId(null)
    }
  }

  const convertToEngagement = async (id: string) => {
    const parsed = parseInt(value.replace(/[^\d]/g, ''), 10)
    if (!parsed || parsed <= 0) { setError('Masukkan nilai engagement (rupiah, bilangan bulat)'); return }
    setBusyId(id); setError('')
    try {
      const res = await fetch('/api/engagements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ submissionId: id, value: parsed }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal membuat engagement'); return }
      onUpdated({ ...inquiries.find(i => i.id === id)!, status: 'JADI_ENGAGEMENT' })
      setConvertFor(null); setValue('')
      onEngagementCreated()
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Leads</h1>
        <p className="text-[14px] text-muted">Pesan masuk dari form contact. Klaim lead lalu jadikan engagement kalau deal.</p>
      </div>

      {error && <div className="mb-5 p-4 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}

      {loading
        ? <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[80px] animate-pulse" />)}</div>
        : inquiries.length === 0
          ? <div className="text-center py-16 text-muted text-[14px]">Belum ada pesan masuk.</div>
          : <div className="space-y-3">
              {inquiries.map(inq => {
                const finder = findMember(inq.finder_id)
                return (
                  <div key={inq.id} className={clsx('bg-surface border rounded-card p-5 transition-all duration-200',
                    inq.is_read ? 'border-white/[0.05] opacity-70' : 'border-violet/20')}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          {!inq.is_read && <span className="w-2 h-2 rounded-full bg-violet flex-shrink-0" />}
                          <span className="font-display font-semibold text-[15px]">{inq.name}</span>
                          <span className="text-[12px] text-muted">{inq.email}</span>
                          {inq.company && <span className="text-[12px] text-muted">· {inq.company}</span>}
                          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{STATUS_LABEL[inq.status]}</span>
                        </div>
                        {(inq.service || inq.budget) && (
                          <div className="flex gap-2 mb-2">
                            {inq.service && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-violet-soft">{inq.service}</span>}
                            {inq.budget && <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{inq.budget}</span>}
                          </div>
                        )}
                        <p className="text-[13px] text-muted leading-[1.65] line-clamp-3">{inq.message}</p>
                        <p className="text-[11px] text-muted/50 mt-2">{new Date(inq.created_at).toLocaleString('id-ID')}</p>

                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                          {finder ? (
                            <span className="text-[12px] text-muted">Finder: <span className="text-ink">{finder.short_name}</span></span>
                          ) : (
                            <span className="text-[12px] text-muted/60">Belum diklaim</span>
                          )}

                          {!finder && isSessionAuth && inq.status !== 'JADI_ENGAGEMENT' && (
                            <button onClick={() => claimLead(inq.id)} disabled={busyId === inq.id}
                              className="text-[12px] font-medium px-3 py-1 rounded-full border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-colors">
                              Klaim lead
                            </button>
                          )}

                          {isAdmin && inq.status !== 'JADI_ENGAGEMENT' && (
                            <select value={inq.finder_id ?? ''} disabled={busyId === inq.id}
                              onChange={e => overrideFinder(inq.id, e.target.value ? Number(e.target.value) : null)}
                              className="bg-bg border border-white/[0.09] rounded-sm px-2 py-1 text-[11px] text-muted outline-none">
                              <option value="">— override finder —</option>
                              {members.map(m => <option key={m.id} value={m.id}>{m.short_name}</option>)}
                            </select>
                          )}

                          {inq.status !== 'JADI_ENGAGEMENT' && (
                            convertFor === inq.id ? (
                              <div className="flex items-center gap-2">
                                <input type="text" placeholder="Nilai (Rp)" value={value}
                                  onChange={e => setValue(e.target.value)}
                                  className="bg-bg border border-white/[0.09] rounded-sm px-2 py-1 text-[12px] text-ink outline-none w-[120px]" />
                                <button onClick={() => convertToEngagement(inq.id)} disabled={busyId === inq.id}
                                  className="text-[12px] font-medium px-3 py-1 rounded-full bg-ink text-bg hover:opacity-90 disabled:opacity-40">
                                  Konfirmasi
                                </button>
                                <button onClick={() => { setConvertFor(null); setValue('') }} className="text-[12px] text-muted hover:text-ink">Batal</button>
                              </div>
                            ) : (
                              <button onClick={() => setConvertFor(inq.id)}
                                className="text-[12px] font-medium px-3 py-1 rounded-full border border-white/[0.09] text-muted hover:text-ink hover:border-white/20 transition-colors">
                                Jadikan Engagement
                              </button>
                            )
                          )}
                        </div>
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
                )
              })}
            </div>
      }
    </div>
  )
}
