import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getPublicEngagementView } from '@/lib/publicEngagementView'
import { PHASE_LABELS_PUBLIC } from '@/lib/engagementPhase'
import PhaseStepper from '@/components/ui/PhaseStepper'

export const metadata: Metadata = {
  title: 'Lacak Progres — NATY',
  robots: { index: false, follow: false },
}

// Public, no login (§9). Everything on this page comes from
// PublicEngagementView — the explicit, column-limited shape from
// src/lib/publicEngagementView.ts. Nothing else about the engagement
// (value, DP/payoff, who's assigned, tasks, other leads) is fetched
// here at all, so there's nothing left to accidentally render.
export default async function TrackPage({ params }: { params: { slug: string } }) {
  const view = await getPublicEngagementView(params.slug)
  if (!view) notFound()

  return (
    <div className="min-h-screen bg-bg text-ink px-6 py-16">
      <div className="max-w-[720px] mx-auto">
        <div className="mb-10">
          <div className="font-display font-bold text-[24px] mb-1">NAT<span className="text-violet">Y</span></div>
          <p className="text-[14px] text-muted">Lacak progres pekerjaan</p>
        </div>

        <div className="bg-surface border border-white/[0.05] rounded-card p-8 mb-6">
          <div className="flex items-center gap-3 mb-1 flex-wrap">
            <h1 className="font-display font-bold text-[24px]">{view.clientName}</h1>
            <span className="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white/[0.06] text-muted">{view.code}</span>
          </div>
          {view.targetDate && (
            <p className="text-[13px] text-muted">
              Target: {new Date(view.targetDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>

        <div className="bg-surface border border-white/[0.05] rounded-card p-8 mb-6">
          <PhaseStepper currentPhase={view.phase} labels={PHASE_LABELS_PUBLIC} />
        </div>

        <div className="bg-surface border border-white/[0.05] rounded-card p-8 mb-6">
          <div className="text-[12px] uppercase tracking-[0.08em] text-muted mb-3">Progress</div>
          <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
            <div className="h-full bg-ink transition-all duration-500" style={{ width: `${view.progressPercent}%` }} />
          </div>
          <div className="mt-2 text-[13px] text-muted">{view.progressPercent}%</div>
        </div>

        {view.publicNote && (
          <div className="bg-surface border border-white/[0.05] rounded-card p-8">
            <div className="text-[12px] uppercase tracking-[0.08em] text-muted mb-2">Catatan dari tim</div>
            <p className="text-[14px] leading-[1.7]">{view.publicNote}</p>
          </div>
        )}
      </div>
    </div>
  )
}
