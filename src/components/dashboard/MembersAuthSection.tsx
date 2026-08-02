'use client'

import { useState } from 'react'
import clsx from 'clsx'
import type { MemberRow } from '@/lib/supabase'

const ACCESS_ROLES = ['ADMIN', 'PM', 'MEMBER'] as const
const STATUSES = ['AKTIF', 'CUTI', 'TIDAK_AKTIF'] as const

interface Props {
  members: MemberRow[]
  password: string
  onUpdated: (updated: MemberRow) => void
}

// ADMIN-only account management: create the Supabase Auth login for a
// member (§5.1 — accounts are admin-created, no public signup exists
// anywhere in this app) and edit access_role/status (§5.2, §5.5).
export default function MembersAuthSection({ members, password, onUpdated }: Props) {
  const [inviteFor, setInviteFor] = useState<number | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [busyId, setBusyId] = useState<number | null>(null)
  const [error, setError] = useState('')

  const patchMember = async (id: number, fields: Record<string, unknown>) => {
    setBusyId(id); setError('')
    try {
      const res = await fetch('/api/members', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ id, ...fields }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal update'); return }
      onUpdated(data)
    } finally {
      setBusyId(null)
    }
  }

  const submitInvite = async (memberId: number) => {
    if (!inviteEmail.trim() || invitePassword.length < 8) {
      setError('Email wajib diisi, password minimal 8 karakter')
      return
    }
    setBusyId(memberId); setError('')
    try {
      const res = await fetch('/api/members/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-dashboard-password': password },
        body: JSON.stringify({ memberId, email: inviteEmail.trim(), password: invitePassword }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Gagal membuat akun'); return }
      onUpdated(data)
      setInviteFor(null); setInviteEmail(''); setInvitePassword('')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display font-bold text-[28px] tracking-[-0.04em] mb-1">Accounts</h1>
        <p className="text-[14px] text-muted">Kelola akun login, peran akses, dan status keaktifan anggota. Hanya ADMIN.</p>
      </div>

      {error && <div className="mb-5 p-4 bg-red/10 border border-red/25 rounded-sm text-[13px] text-red">⚠ {error}</div>}

      <div className="space-y-3">
        {members.map(m => (
          <div key={m.id} className="bg-surface border border-white/[0.05] rounded-card p-5 flex flex-wrap items-center gap-4">
            <div className="min-w-[160px]">
              <div className="font-display font-semibold text-[14px]">{m.name}</div>
              <div className="text-[12px] text-muted">{m.email ?? 'belum ada akun'}</div>
            </div>

            <select value={m.access_role ?? 'MEMBER'} disabled={busyId === m.id}
              onChange={e => patchMember(m.id, { access_role: e.target.value })}
              className="bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none">
              {ACCESS_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            <select value={m.status ?? 'AKTIF'} disabled={busyId === m.id}
              onChange={e => patchMember(m.id, { status: e.target.value })}
              className="bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            <div className="ml-auto">
              {m.auth_user_id ? (
                <span className="text-[12px] text-ink">✓ Akun aktif</span>
              ) : inviteFor === m.id ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input type="email" placeholder="nama@natynext.com" value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    className="bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none w-[200px]" />
                  <input type="password" placeholder="Password (min. 8)" value={invitePassword}
                    onChange={e => setInvitePassword(e.target.value)}
                    className="bg-bg border border-white/[0.09] rounded-sm px-3 py-2 text-[13px] text-ink outline-none w-[160px]" />
                  <button onClick={() => submitInvite(m.id)} disabled={busyId === m.id}
                    className="px-3 py-2 bg-ink text-bg font-display font-semibold text-[12px] rounded-sm hover:opacity-90 disabled:opacity-40">
                    Buat
                  </button>
                  <button onClick={() => setInviteFor(null)} className="text-[12px] text-muted hover:text-ink">Batal</button>
                </div>
              ) : (
                <button onClick={() => setInviteFor(m.id)}
                  className={clsx('px-3 py-2 border border-white/[0.09] rounded-sm text-[12px] text-muted hover:text-ink hover:border-white/20 transition-colors')}>
                  Buat akun
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
