'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { EngagementRow, MemberRow } from '@/lib/supabase'
import { PHASES, PHASE_LABELS_INTERNAL, type Phase } from '@/lib/engagementPhase'
import { LEVEL_POINTS, type Discipline, type ScopeLevel } from '@/lib/payout'
import PhaseStepper from '@/components/ui/PhaseStepper'
import ScrumBoard from '@/components/dashboard/ScrumBoard'

interface Props {
  engagements: EngagementRow[]
  members: MemberRow[]
  loading: boolean
  password: string
  canManage: boolean
  canExecutePayout: boolean
  currentMemberId: number | null
  onUpdated: (updated: EngagementRow) => void
}

type Assignment = { member_id: number; share_percent: number }
type ScopeItem = {
  id: string
  discipline: Discipline
  level: ScopeLevel
  points: number
  penalty_percent: number
  penalty_reason: string | null
  assignments: Assignment[]
}
type Payout = { id: string; member_id: number | null; type: string; amount: number }

const DISCIPLINES: Discipline[] = ['FRONTEND', 'BACKEND', 'DESIGN', 'PM_QA']
const DISCIPLINE_LABEL: Record<Discipline, string> = {
  FRONTEND: 'Frontend', BACKEND: 'Backend', DESIGN: 'Design', PM_QA: 'PM & QA',
}

function formatRupiah(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function ScopeRow({
  discipline, existing, members, password, engagementId, canManage, onSaved,
}: {
  discipline: Discipline
  existing?: ScopeItem
  members: MemberRow[]
  password: string
  engagementId: string
  canManage: boolean
  onSaved: (item: ScopeItem) => void
}) {
  const [level, setLevel] = useState<ScopeLevel>(existing?.level ?? 0)
  const [penalty, setPenalty] = useState(existing?.penalty_percent ?? 0)
  const [reason, setReason] = useState(existing?.penalty_reason ?? '')
  const [rows, setRows] = useState<Assignment[]>(existing?.assignments ?? [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const addRow = () => setRows(prev => [...prev, { member_id: members[0]?.id ?? 0, share_percent: prev.length === 0 ? 100 : 0 }])
  const removeRow = (i: number) => setRows(prev => prev.filter((_, idx) => idx !== i))
  const updateRow = (i: number, patch: Partial<Assignment>) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, ...patch } : r))

  const save = async () => {
    setSaving(true); setError('')
    try {
      const res = await fetch(`/api/engagements/${engagementId}/scope`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({
          discipline, level, penaltyPercent: penalty, penaltyReason: reason,
          assignments: rows.map(r => ({ memberId: r.member_id, sharePercent: r.share_percent })),
        }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal simpan'); return }
      onSaved(data)
    } finally {
      setSaving(false)
    }
  }

  const totalShare = rows.reduce((s, r) => s + r.share_percent, 0)

  return (
    <div className="bg-surface border border-white/[0.05] rounded-card p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-[14px]">{DISCIPLINE_LABEL[discipline]}</span>
        <span className="text-[12px] text-muted">{LEVEL_POINTS[level]} poin</span>
      </div>

      {canManage ? (
        <>
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <select value={level} onChange={e => setLevel(Number(e.target.value) as ScopeLevel)}
              className="bg-bg border border-white/[0.09] rounded-sm px-3 py-1.5 text-[12px] text-ink outline-none">
              {[0, 1, 2, 3, 4, 5].map(l => <option key={l} value={l}>Level {l} ({LEVEL_POINTS[l as ScopeLevel]} poin)</option>)}
            </select>
            <input type="number" min={0} max={20} value={penalty} onChange={e => setPenalty(Number(e.target.value))}
              placeholder="Penalti %" className="bg-bg border border-white/[0.09] rounded-sm px-3 py-1.5 text-[12px] text-ink outline-none w-[100px]" />
            {penalty > 0 && (
              <input type="text" value={reason} onChange={e => setReason(e.target.value)}
                placeholder="Alasan penalti (wajib)" className="bg-bg border border-white/[0.09] rounded-sm px-3 py-1.5 text-[12px] text-ink outline-none flex-1 min-w-[160px]" />
            )}
          </div>

          <div className="space-y-2 mb-3">
            {rows.map((r, i) => (
              <div key={i} className="flex items-center gap-2">
                <select value={r.member_id} onChange={e => updateRow(i, { member_id: Number(e.target.value) })}
                  className="bg-bg border border-white/[0.09] rounded-sm px-2 py-1 text-[12px] text-ink outline-none">
                  {members.map(m => <option key={m.id} value={m.id}>{m.short_name}</option>)}
                </select>
                <input type="number" min={1} max={100} value={r.share_percent}
                  onChange={e => updateRow(i, { share_percent: Number(e.target.value) })}
                  className="bg-bg border border-white/[0.09] rounded-sm px-2 py-1 text-[12px] text-ink outline-none w-[70px]" />
                <span className="text-[11px] text-muted">%</span>
                <button onClick={() => removeRow(i)} className="text-[11px] text-red hover:opacity-80">Hapus</button>
              </div>
            ))}
            <button onClick={addRow} className="text-[12px] text-muted hover:text-ink">+ Tambah assignment</button>
            {rows.length > 0 && (
              <p className={clsx('text-[11px]', totalShare === 100 ? 'text-muted' : 'text-red')}>Total share: {totalShare}% {totalShare !== 100 && '(harus 100%)'}</p>
            )}
          </div>

          {error && <p className="text-[12px] text-red mb-2">⚠ {error}</p>}
          <button onClick={save} disabled={saving}
            className="px-3 py-1.5 bg-ink text-bg font-display font-semibold text-[12px] rounded-sm hover:opacity-90 disabled:opacity-40">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </>
      ) : (
        <div className="text-[12px] text-muted">
          {existing?.assignments.length
            ? existing.assignments.map(a => members.find(m => m.id === a.member_id)?.short_name ?? a.member_id).join(', ')
            : 'Belum di-scope'}
        </div>
      )}
    </div>
  )
}

export default function EngagementsSection({
  engagements, members, loading, password, canManage, canExecutePayout, currentMemberId, onUpdated,
}: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([])
  const [payouts, setPayouts] = useState<Payout[]>([])

  const selected = engagements.find(e => e.id === selectedId) ?? null

  useEffect(() => {
    if (!selectedId) return
    fetch(`/api/engagements/${selectedId}/scope`, { headers: { 'x-dashboard-password': password } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setScopeItems(d) })
    fetch(`/api/engagements/${selectedId}/payout`, { headers: { 'x-dashboard-password': password } })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setPayouts(d) })
  }, [selectedId, password])

  const patch = async (id: string, body: Record<string, unknown>) => {
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/engagements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal update'); return }
      onUpdated(data)
    } finally {
      setBusy(false)
    }
  }

  const executePayout = async () => {
    if (!selected) return
    if (!confirm(`Eksekusi payout untuk ${selected.code}? Aksi ini tidak bisa diulang.`)) return
    setBusy(true); setError('')
    try {
      const res = await fetch(`/api/engagements/${selected.id}/payout`, {
        method: 'POST',
        headers: { 'x-dashboard-password': password },
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal eksekusi payout'); return }
      setPayouts(data)
    } finally {
      setBusy(false)
    }
  }

  if (selected) {
    const curIdx = PHASES.indexOf(selected.phase)
    const nextPhase: Phase | null = curIdx < PHASES.length - 1 ? PHASES[curIdx + 1] : null
    const memberName = (id: number | null) => id === null ? 'Kas NATY' : (members.find(m => m.id === id)?.short_name ?? `#${id}`)

    return (
      <div>
        <button onClick={() => setSelectedId(null)} className="text-[13px] text-muted hover:text-ink mb-6">← Semua engagement</button>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="font-display font-bold text-[28px] tracking-[-0.04em]">{selected.client_name}</h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{selected.code}</span>
          </div>
          <p className="text-[14px] text-muted">{formatRupiah(selected.value)} · {selected.client_contact}</p>
        </div>

        {error && <div className="mb-5 p-4 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}

        <div className="bg-surface border border-white/[0.05] rounded-card p-6 mb-6">
          <PhaseStepper currentPhase={selected.phase} labels={PHASE_LABELS_INTERNAL} />
        </div>

        {canManage && (
          <div className="flex flex-wrap items-center gap-3 mb-8">
            {!selected.dp_received_at && (
              <button onClick={() => patch(selected.id, { markDpReceived: true })} disabled={busy}
                className="px-4 py-2 border border-white/[0.09] rounded-sm text-[13px] text-muted hover:text-ink hover:border-white/20 transition-colors">
                Tandai DP diterima
              </button>
            )}
            {!selected.paid_off_at && (
              <button onClick={() => patch(selected.id, { markPaidOff: true })} disabled={busy}
                className="px-4 py-2 border border-white/[0.09] rounded-sm text-[13px] text-muted hover:text-ink hover:border-white/20 transition-colors">
                Tandai pelunasan diterima
              </button>
            )}
            {nextPhase && (
              <button onClick={() => patch(selected.id, { phase: nextPhase })} disabled={busy}
                className="px-4 py-2 bg-ink text-bg font-display font-semibold text-[13px] rounded-sm hover:opacity-90 disabled:opacity-40">
                Lanjut ke {PHASE_LABELS_INTERNAL[nextPhase]} →
              </button>
            )}
            {curIdx > 0 && (
              <button onClick={() => patch(selected.id, { phase: PHASES[curIdx - 1] })} disabled={busy}
                className="px-4 py-2 text-[13px] text-muted hover:text-ink transition-colors">
                ← Mundur ke {PHASE_LABELS_INTERNAL[PHASES[curIdx - 1]]}
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-surface border border-white/[0.05] rounded-card p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">Progress</div>
            <div className="font-display font-bold text-[20px]">{selected.progress_percent}%</div>
          </div>
          <div className="bg-surface border border-white/[0.05] rounded-card p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">DP</div>
            <div className="font-display font-bold text-[14px]">{selected.dp_received_at ? new Date(selected.dp_received_at).toLocaleDateString('id-ID') : '—'}</div>
          </div>
          <div className="bg-surface border border-white/[0.05] rounded-card p-4">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted mb-1">Pelunasan</div>
            <div className="font-display font-bold text-[14px]">{selected.paid_off_at ? new Date(selected.paid_off_at).toLocaleDateString('id-ID') : '—'}</div>
          </div>
        </div>

        {/* ── SCOPING ── */}
        <div className="mb-8">
          <h2 className="font-display font-bold text-[18px] mb-4">Scoping</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DISCIPLINES.map(d => (
              <ScopeRow key={d} discipline={d} existing={scopeItems.find(s => s.discipline === d)}
                members={members} password={password} engagementId={selected.id} canManage={canManage}
                onSaved={item => setScopeItems(prev => {
                  const rest = prev.filter(s => s.discipline !== item.discipline)
                  return [...rest, item]
                })}
              />
            ))}
          </div>
        </div>

        {/* ── PAYOUT ── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-[18px]">Payout</h2>
            {canExecutePayout && payouts.length === 0 && (
              <button onClick={executePayout} disabled={busy || !selected.paid_off_at}
                title={!selected.paid_off_at ? 'Tunggu pelunasan diterima' : undefined}
                className="px-4 py-2 bg-ink text-bg font-display font-semibold text-[13px] rounded-sm hover:opacity-90 disabled:opacity-40">
                Eksekusi Payout
              </button>
            )}
          </div>
          {payouts.length === 0
            ? <p className="text-[13px] text-muted">Belum dieksekusi.</p>
            : <div className="space-y-2">
                {payouts.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-surface border border-white/[0.05] rounded-sm px-4 py-2.5">
                    <span className="text-[13px]">
                      {memberName(p.member_id)}
                      <span className="text-muted ml-2 text-[11px]">{p.type}</span>
                      {p.member_id === currentMemberId && <span className="ml-2 text-[10px] text-violet-soft">(kamu)</span>}
                    </span>
                    <span className="font-display font-semibold text-[13px]">{formatRupiah(p.amount)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between px-4 pt-2 text-[12px] text-muted">
                  <span>Total</span>
                  <span>{formatRupiah(payouts.reduce((s, p) => s + p.amount, 0))}</span>
                </div>
              </div>
          }
        </div>

        {/* ── SCRUM BOARD ── */}
        <div className="mb-10">
          <ScrumBoard
            engagementId={selected.id}
            members={members}
            password={password}
            currentMemberId={currentMemberId}
            canManage={canManage}
          />
        </div>

        {canManage && (
          <div>
            <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-2">Catatan untuk klien (public_note)</label>
            <textarea defaultValue={selected.public_note ?? ''} rows={3}
              onBlur={e => patch(selected.id, { public_note: e.target.value })}
              placeholder="Muncul di halaman tracking klien — jangan tulis info internal di sini."
              className="w-full bg-surface border border-white/[0.09] rounded-sm px-4 py-3 text-[14px] text-ink outline-none resize-none" />
            <p className="mt-2 text-[12px] text-muted">
              Link tracking klien: <span className="text-ink">/track/{selected.public_slug}</span>
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Engagements</h1>
        <p className="text-[14px] text-muted">Pekerjaan klien berbayar — terpisah dari showcase portfolio publik.</p>
      </div>

      {loading
        ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-surface border border-white/[0.05] rounded-card h-[72px] animate-pulse" />)}</div>
        : engagements.length === 0
          ? <div className="text-center py-16 text-muted text-[14px]">Belum ada engagement. Jadikan lead di tab Leads.</div>
          : <div className="space-y-3">
              {engagements.map(e => (
                <button key={e.id} onClick={() => setSelectedId(e.id)}
                  className="w-full text-left bg-surface border border-white/[0.05] rounded-card p-5 hover:border-white/20 transition-colors flex items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-display font-semibold text-[15px]">{e.client_name}</span>
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{e.code}</span>
                    </div>
                    <div className="text-[12px] text-muted">{formatRupiah(e.value)}</div>
                  </div>
                  <span className={clsx('text-[12px] font-medium px-3 py-1 rounded-full border border-white/[0.09] text-muted')}>
                    {PHASE_LABELS_INTERNAL[e.phase]}
                  </span>
                </button>
              ))}
            </div>
      }
    </div>
  )
}
