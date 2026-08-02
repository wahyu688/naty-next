'use client'

import { useState, useEffect } from 'react'
import clsx from 'clsx'
import type { MemberRow, SprintRow, TaskRow, TaskStatus, StandupRow, ChangeRequestRow } from '@/lib/supabase'

interface Props {
  engagementId: string
  members: MemberRow[]
  password: string
  currentMemberId: number | null
  canManage: boolean
}

const COLUMNS: { key: TaskStatus; label: string }[] = [
  { key: 'BACKLOG', label: 'Backlog' },
  { key: 'DIKERJAKAN', label: 'Dikerjakan' },
  { key: 'DIREVIEW', label: 'Direview' },
  { key: 'SELESAI', label: 'Selesai' },
]

// M6 — 4-column SCRUM board with dropdown status change (no drag-and-
// drop, per CLAUDE.md §10 fallback), standups, and change requests.
// Self-contained: fetches its own data given just the engagement id.
export default function ScrumBoard({ engagementId, members, password, currentMemberId, canManage }: Props) {
  const [sprints, setSprints] = useState<SprintRow[]>([])
  const [activeSprintId, setActiveSprintId] = useState<string | null>(null)
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [standups, setStandups] = useState<StandupRow[]>([])
  const [changeRequests, setChangeRequests] = useState<ChangeRequestRow[]>([])

  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [newCrText, setNewCrText] = useState('')
  const [standupForm, setStandupForm] = useState({ yesterday: '', today: '', blocker: '' })
  const [error, setError] = useState('')

  const authHeaders = { 'x-dashboard-password': password }
  const jsonHeaders = { 'Content-Type': 'application/json', 'x-dashboard-password': password }

  const loadSprints = () => fetch(`/api/engagements/${engagementId}/sprints`, { headers: authHeaders })
    .then(r => r.json()).then(d => { if (Array.isArray(d)) { setSprints(d); if (!activeSprintId && d.length) setActiveSprintId(d[d.length - 1].id) } })

  const loadTasks = () => fetch(`/api/engagements/${engagementId}/tasks`, { headers: authHeaders })
    .then(r => r.json()).then(d => { if (Array.isArray(d)) setTasks(d) })

  const loadChangeRequests = () => fetch(`/api/engagements/${engagementId}/change-requests`, { headers: authHeaders })
    .then(r => r.json()).then(d => { if (Array.isArray(d)) setChangeRequests(d) })

  useEffect(() => { loadSprints(); loadTasks(); loadChangeRequests() }, [engagementId])

  useEffect(() => {
    if (!activeSprintId) return
    fetch(`/api/sprints/${activeSprintId}/standups`, { headers: authHeaders })
      .then(r => r.json()).then(d => { if (Array.isArray(d)) setStandups(d) })
  }, [activeSprintId])

  const createSprint = async () => {
    const res = await fetch(`/api/engagements/${engagementId}/sprints`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({}) })
    const data = await res.json()
    if (res.ok) { setSprints(prev => [...prev, data]); setActiveSprintId(data.id) }
  }

  const createTask = async () => {
    if (!newTaskTitle.trim()) return
    const res = await fetch(`/api/engagements/${engagementId}/tasks`, {
      method: 'POST', headers: jsonHeaders,
      body: JSON.stringify({ title: newTaskTitle.trim(), sprintId: activeSprintId }),
    })
    const data = await res.json()
    if (res.ok) { setTasks(prev => [...prev, data]); setNewTaskTitle('') } else setError(data.error)
  }

  const updateTask = async (taskId: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/engagements/${engagementId}/tasks/${taskId}`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify(body) })
    const data = await res.json()
    if (res.ok) setTasks(prev => prev.map(t => t.id === taskId ? data : t)); else setError(data.error)
  }

  const submitStandup = async () => {
    if (!activeSprintId) return
    const res = await fetch(`/api/sprints/${activeSprintId}/standups`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify(standupForm) })
    const data = await res.json()
    if (res.ok) { setStandups(prev => [data, ...prev.filter(s => s.id !== data.id)]); setStandupForm({ yesterday: '', today: '', blocker: '' }) }
    else setError(data.error)
  }

  const submitChangeRequest = async () => {
    if (!newCrText.trim()) return
    const res = await fetch(`/api/engagements/${engagementId}/change-requests`, { method: 'POST', headers: jsonHeaders, body: JSON.stringify({ description: newCrText.trim() }) })
    const data = await res.json()
    if (res.ok) { setChangeRequests(prev => [data, ...prev]); setNewCrText('') } else setError(data.error)
  }

  const decideChangeRequest = async (id: string, decision: string) => {
    const extraCharge = decision === 'BERBAYAR' ? Number(prompt('Biaya tambahan (Rp)?', '0') ?? 0) : 0
    const res = await fetch(`/api/engagements/${engagementId}/change-requests`, { method: 'PATCH', headers: jsonHeaders, body: JSON.stringify({ id, decision, extraCharge }) })
    const data = await res.json()
    if (res.ok) setChangeRequests(prev => prev.map(c => c.id === id ? data : c))
  }

  const memberName = (id: number | null) => id === null ? '—' : (members.find(m => m.id === id)?.short_name ?? `#${id}`)
  const today = new Date().toISOString().slice(0, 10)
  const todaysStandups = standups.filter(s => s.date === today)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <h2 className="font-display font-bold text-[18px]">Papan Kerja</h2>
        <div className="flex items-center gap-2">
          <select value={activeSprintId ?? ''} onChange={e => setActiveSprintId(e.target.value || null)}
            className="bg-bg border border-white/[0.09] rounded-sm px-3 py-1.5 text-[12px] text-ink outline-none">
            <option value="">Semua sprint</option>
            {sprints.map(s => <option key={s.id} value={s.id}>Sprint {s.number}</option>)}
          </select>
          {canManage && <button onClick={createSprint} className="text-[12px] text-muted hover:text-ink">+ Sprint baru</button>}
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red/10 border border-red/25 rounded-sm text-[12px] text-red">⚠ {error}</div>}

      <div className="flex items-center gap-2 mb-6">
        <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && createTask()}
          placeholder="Tambah task baru..."
          className="flex-1 bg-surface border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none" />
        <button onClick={createTask} className="px-4 py-2 bg-ink text-bg font-display font-semibold text-[12px] rounded-sm hover:opacity-90">Tambah</button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {COLUMNS.map(col => (
          <div key={col.key} className="bg-surface border border-white/[0.05] rounded-card p-3">
            <div className="text-[11px] uppercase tracking-[0.08em] text-muted mb-3 px-1">{col.label} · {tasks.filter(t => t.status === col.key && (!activeSprintId || t.sprint_id === activeSprintId)).length}</div>
            <div className="space-y-2">
              {tasks.filter(t => t.status === col.key && (!activeSprintId || t.sprint_id === activeSprintId)).map(t => {
                const canEdit = canManage || t.assignee_id === currentMemberId
                return (
                  <div key={t.id} className="bg-bg border border-white/[0.05] rounded-sm p-3">
                    <div className="text-[13px] mb-2">{t.title}</div>
                    <div className="flex items-center justify-between gap-2">
                      <select value={t.assignee_id ?? ''} disabled={!canEdit}
                        onChange={e => updateTask(t.id, { assigneeId: e.target.value ? Number(e.target.value) : null })}
                        className="bg-surface border border-white/[0.09] rounded-sm px-1.5 py-1 text-[11px] text-muted outline-none disabled:opacity-60">
                        <option value="">— siapa —</option>
                        {members.map(m => <option key={m.id} value={m.id}>{m.short_name}</option>)}
                      </select>
                      <select value={t.status} disabled={!canEdit}
                        onChange={e => updateTask(t.id, { status: e.target.value })}
                        className="bg-surface border border-white/[0.09] rounded-sm px-1.5 py-1 text-[11px] text-ink outline-none disabled:opacity-60">
                        {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
                      </select>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {activeSprintId && (
        <div className="mb-10">
          <h3 className="font-display font-bold text-[16px] mb-3">Standup hari ini</h3>
          {currentMemberId && (
            <div className="bg-surface border border-white/[0.05] rounded-card p-4 mb-3 space-y-2">
              <input type="text" placeholder="Kemarin ngapain" value={standupForm.yesterday}
                onChange={e => setStandupForm(f => ({ ...f, yesterday: e.target.value }))}
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none" />
              <input type="text" placeholder="Hari ini ngapain" value={standupForm.today}
                onChange={e => setStandupForm(f => ({ ...f, today: e.target.value }))}
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none" />
              <input type="text" placeholder="Ada blocker?" value={standupForm.blocker}
                onChange={e => setStandupForm(f => ({ ...f, blocker: e.target.value }))}
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none" />
              <button onClick={submitStandup} className="px-4 py-2 bg-ink text-bg font-display font-semibold text-[12px] rounded-sm hover:opacity-90">Simpan standup</button>
            </div>
          )}
          <div className="space-y-2">
            {todaysStandups.map(s => (
              <div key={s.id} className="bg-surface border border-white/[0.05] rounded-sm p-3 text-[12px]">
                <span className="font-semibold text-ink">{memberName(s.member_id)}</span>
                <span className="text-muted"> — kemarin: {s.yesterday || '-'} · hari ini: {s.today || '-'}{s.blocker && <span className="text-red"> · blocker: {s.blocker}</span>}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="font-display font-bold text-[16px] mb-3">Change Requests</h3>
        <div className="flex items-center gap-2 mb-3">
          <input type="text" value={newCrText} onChange={e => setNewCrText(e.target.value)}
            placeholder="Klien minta perubahan apa?"
            className="flex-1 bg-surface border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none" />
          <button onClick={submitChangeRequest} className="px-4 py-2 bg-ink text-bg font-display font-semibold text-[12px] rounded-sm hover:opacity-90">Catat</button>
        </div>
        <div className="space-y-2">
          {changeRequests.map(cr => (
            <div key={cr.id} className="bg-surface border border-white/[0.05] rounded-sm p-3 flex items-center justify-between gap-3">
              <div className="text-[13px]">{cr.description}</div>
              {cr.decision ? (
                <span className="text-[11px] font-medium px-2 py-1 rounded-full bg-white/[0.06] text-muted whitespace-nowrap">
                  {cr.decision}{cr.decision === 'BERBAYAR' && cr.extra_charge > 0 && ` · +Rp${cr.extra_charge.toLocaleString('id-ID')}`}
                </span>
              ) : canManage ? (
                <div className="flex gap-1 flex-shrink-0">
                  {(['GRATIS', 'BERBAYAR', 'FASE_2'] as const).map(d => (
                    <button key={d} onClick={() => decideChangeRequest(cr.id, d)}
                      className={clsx('text-[11px] px-2 py-1 rounded-full border border-white/[0.09] text-muted hover:text-ink hover:border-white/20')}>
                      {d}
                    </button>
                  ))}
                </div>
              ) : <span className="text-[11px] text-muted/60">Menunggu keputusan</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
