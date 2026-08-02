import clsx from 'clsx'
import { PHASES, type Phase } from '@/lib/engagementPhase'

interface PhaseStepperProps {
  currentPhase: Phase
  labels: Record<Phase, string>
  className?: string
}

// Horizontal 8-point stepper, shared by the dashboard (internal/
// technical labels) and the public /track/[slug] portal (friendly
// labels) — one implementation, two label sets (locked design
// decision from the M1 report).
export default function PhaseStepper({ currentPhase, labels, className }: PhaseStepperProps) {
  const currentIdx = PHASES.indexOf(currentPhase)

  return (
    <div className={clsx('w-full overflow-x-auto [scrollbar-width:none]', className)}>
      <div className="flex items-start min-w-[640px] sm:min-w-0">
        {PHASES.map((phase, i) => {
          const done = i < currentIdx
          const active = i === currentIdx

          return (
            <div key={phase} className="flex-1 flex flex-col items-center">
              <div className="flex items-center w-full">
                <div className={clsx('flex-1 h-[2px]', i === 0 ? 'bg-transparent' : i <= currentIdx ? 'bg-ink' : 'bg-white/10')} />
                <div className={clsx(
                  'w-6 h-6 flex-shrink-0 rounded-full flex items-center justify-center text-[11px] font-display font-bold border-2 transition-all duration-200',
                  done ? 'bg-ink border-ink text-bg'
                    : active ? 'bg-bg border-ink text-ink'
                    : 'bg-bg border-white/15 text-muted'
                )}>
                  {done ? '✓' : i + 1}
                </div>
                <div className={clsx('flex-1 h-[2px]', i === PHASES.length - 1 ? 'bg-transparent' : i < currentIdx ? 'bg-ink' : 'bg-white/10')} />
              </div>
              <span className={clsx(
                'mt-2 text-[11px] text-center px-1 leading-tight',
                active ? 'text-ink font-semibold' : done ? 'text-muted' : 'text-muted/50'
              )}>
                {labels[phase]}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
