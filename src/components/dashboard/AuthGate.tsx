'use client'

import { useState } from 'react'
import clsx from 'clsx'

export type SessionMemberInfo = { id: number; name: string; access_role: string }
export type UnlockMode = 'session' | 'legacy'

interface AuthGateProps {
  onUnlock: (token: string, mode: UnlockMode, member?: SessionMemberInfo) => void
}

// Two ways in, side by side per CLAUDE.md §5.3 — the new per-member
// Supabase Auth login (default), with the old shared-password gate kept
// alive as an explicit fallback. Remove the fallback only when told to.
export default function AuthGate({ onUnlock }: AuthGateProps) {
  const [mode, setMode] = useState<'session' | 'legacy'>('session')

  const [email, setEmail] = useState('')
  const [sessionPwd, setSessionPwd] = useState('')
  const [legacyPwd, setLegacyPwd] = useState('')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSessionLogin = async () => {
    if (!email.trim() || !sessionPwd) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: sessionPwd }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Login gagal'); return }
      onUnlock('__session_auth__', 'session', data.member)
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleLegacyLogin = async () => {
    if (!legacyPwd.trim()) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/members', { headers: { 'x-dashboard-password': legacyPwd } })
      if (res.ok) { onUnlock(legacyPwd, 'legacy') } else { setError('Password salah') }
    } catch {
      setError('Terjadi kesalahan jaringan')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = () => (mode === 'session' ? handleSessionLogin() : handleLegacyLogin())

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

          {mode === 'session' ? (
            <>
              <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-3">Email @natynext.com</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="nama@natynext.com" autoFocus
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px] mb-3
                           text-ink outline-none transition-all duration-200
                           focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                           placeholder:text-muted/40" />
              <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-3">Password</label>
              <input type="password" value={sessionPwd} onChange={e => setSessionPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Password akun"
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px]
                           text-ink outline-none transition-all duration-200
                           focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                           placeholder:text-muted/40" />
            </>
          ) : (
            <>
              <label className="block text-[12px] font-medium tracking-[0.08em] uppercase text-muted mb-3">Password lama</label>
              <input type="password" value={legacyPwd} onChange={e => setLegacyPwd(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="Enter dashboard password" autoFocus
                className="w-full bg-bg border border-white/[0.09] rounded-sm px-4 py-3 text-[14px]
                           text-ink outline-none transition-all duration-200
                           focus:border-violet/50 focus:shadow-[0_0_0_3px_rgba(255,255,255,0.08)]
                           placeholder:text-muted/40" />
            </>
          )}

          {error && <p className="text-[12px] text-red mt-2">{error}</p>}

          <button onClick={handleSubmit} disabled={loading}
            className="mt-4 w-full font-display font-semibold text-[14px] py-3 rounded-sm
                       bg-ink text-bg transition-all duration-200 hover:opacity-90 disabled:opacity-50">
            {loading ? 'Checking...' : 'Enter Dashboard →'}
          </button>

          <button
            onClick={() => { setMode(m => m === 'session' ? 'legacy' : 'session'); setError('') }}
            className="mt-4 w-full text-center text-[12px] text-muted hover:text-ink transition-colors">
            {mode === 'session' ? 'Pakai password lama →' : '← Kembali ke login akun'}
          </button>
        </div>
      </div>
    </div>
  )
}
