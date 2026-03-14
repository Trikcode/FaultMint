import Link from 'next/link'
import {
  ArrowRight,
  FileText,
  Zap,
  ListChecks,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'

const STEPS = [
  {
    number: 1,
    icon: FileText,
    title: 'Paste Release Notes',
    description:
      'Drop your changelog, diff summary, or release notes into FaultMint.',
  },
  {
    number: 2,
    icon: Zap,
    title: 'AI Risk Analysis',
    description:
      'The engine scans for failure patterns and surfaces severity-ranked risks.',
  },
  {
    number: 3,
    icon: ListChecks,
    title: 'Track & Approve',
    description:
      'Resolve risks, complete the mitigation checklist, collect team sign-offs.',
  },
  {
    number: 4,
    icon: ShieldCheck,
    title: 'Ship or Block',
    description: 'Get a real-time verdict. Only ship when every gate is green.',
  },
]

function MockDashboard() {
  return (
    <div className='relative animate-hero-float'>
      <div className='absolute -inset-6 rounded-3xl bg-indigo-500/[0.08] blur-3xl' />

      <div className='relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] shadow-2xl shadow-black/50 backdrop-blur-sm'>
        {/* Window chrome */}
        <div className='flex items-center gap-1.5 border-b border-white/[0.06] bg-white/[0.04] px-4 py-2.5'>
          <span className='h-2.5 w-2.5 rounded-full bg-[#ff5f57]/60' />
          <span className='h-2.5 w-2.5 rounded-full bg-[#febc2e]/60' />
          <span className='h-2.5 w-2.5 rounded-full bg-[#28c840]/60' />
          <span className='ml-3 font-mono text-[10px] text-white/25'>
            faultmint.app/releases/a3x…
          </span>
        </div>

        <div className='space-y-4 p-5'>
          {/* Release header */}
          <div>
            <span className='inline-block rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-white/50'>
              v2.4.0
            </span>
            <h3 className='mt-1 text-[13px] font-semibold text-white/90'>
              Payment Gateway Migration
            </h3>
          </div>

          {/* Status row */}
          <div className='flex items-center gap-2'>
            <span className='rounded-md border border-blue-400/20 bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold text-blue-300'>
              ANALYZED
            </span>
            <span className='rounded-md border border-red-400/20 bg-red-500/15 px-2 py-0.5 text-[10px] font-semibold text-red-300'>
              BLOCKED
            </span>
            <div className='ml-auto text-right'>
              <div className='score-pulse text-xl font-bold leading-none tabular-nums text-red-400'>
                78
              </div>
              <div className='mt-0.5 text-[8px] uppercase tracking-[0.15em] text-white/25'>
                risk score
              </div>
            </div>
          </div>

          <div className='h-px bg-white/[0.06]' />

          {/* Risks */}
          <div className='space-y-1.5'>
            <p className='text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25'>
              Predicted Risks
            </p>
            <div className='space-y-1'>
              <div className='mock-risk-row'>
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-400 shadow-[0_0_4px_1px_rgba(248,113,113,0.4)]' />
                <span className='flex-1 truncate text-[11px] text-white/70'>
                  Breaking change in webhook payload
                </span>
                <span className='text-[9px] font-bold text-red-400'>CRIT</span>
              </div>
              <div className='mock-risk-row'>
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-orange-400 shadow-[0_0_4px_1px_rgba(251,146,60,0.4)]' />
                <span className='flex-1 truncate text-[11px] text-white/70'>
                  Billing cycle off-by-one error
                </span>
                <span className='text-[9px] font-bold text-orange-400'>
                  HIGH
                </span>
              </div>
              <div className='mock-risk-row opacity-50'>
                <span className='h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-400' />
                <span className='flex-1 truncate text-[11px] text-white/50 line-through'>
                  Retry logic may duplicate charges
                </span>
                <span className='text-[9px] font-bold text-green-400'>MED</span>
              </div>
            </div>
          </div>

          <div className='h-px bg-white/[0.06]' />

          {/* Checklist */}
          <div>
            <div className='mb-1.5 flex items-center justify-between'>
              <p className='text-[9px] font-semibold uppercase tracking-[0.15em] text-white/25'>
                Mitigation
              </p>
              <span className='text-[10px] tabular-nums text-white/35'>
                3 / 5
              </span>
            </div>
            <div className='h-1.5 overflow-hidden rounded-full bg-white/[0.06]'>
              <div className='h-full w-3/5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500' />
            </div>
          </div>

          <div className='h-px bg-white/[0.06]' />

          {/* Approvals */}
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-1.5'>
              <CheckCircle2 className='h-3.5 w-3.5 text-green-400' />
              <span className='text-[10px] font-medium text-white/45'>ENG</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <XCircle className='h-3.5 w-3.5 text-red-400' />
              <span className='text-[10px] font-medium text-white/45'>QA</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <Clock className='h-3.5 w-3.5 text-yellow-400' />
              <span className='text-[10px] font-medium text-white/45'>
                PROD
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className='space-y-24 pb-12'>
      {/* ═══════════ HERO ═══════════ */}
      <section className='relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 px-6 py-14 sm:px-10 sm:py-20 lg:px-14 lg:py-24'>
        {/* Dot grid */}
        <div className='hero-grid absolute inset-0' />
        {/* Accent glow */}
        <div className='absolute inset-0 bg-[radial-gradient(ellipse_at_70%_40%,rgba(99,102,241,0.12),transparent_60%)]' />

        <div className='relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16'>
          {/* Copy */}
          <div className='max-w-xl'>
            <h1 className='stagger-1 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[3.4rem] lg:leading-[1.1]'>
              Know what breaks{' '}
              <span className='bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent'>
                before it ships.
              </span>
            </h1>

            <p className='stagger-2 mt-6 text-base leading-relaxed text-gray-400 sm:text-lg'>
              FaultMint runs AI pre-mortem analysis on every release. Paste your
              notes, surface failure risks, track mitigations, collect
              approvals, and gate deployments with a live ship-or-block verdict.
            </p>

            <div className='stagger-3 mt-8 flex flex-wrap gap-3'>
              <Link
                href='/dashboard'
                className='focus-ring inline-flex items-center gap-2 rounded-lg bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-400 hover:shadow-indigo-500/30'
              >
                Open Dashboard
                <ArrowRight className='h-4 w-4' />
              </Link>
              <Link
                href='/releases/new'
                className='focus-ring inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-gray-300 transition-colors hover:bg-white/10 hover:text-white'
              >
                Create a Release
              </Link>
            </div>
          </div>

          {/* Mock dashboard */}
          <div className='stagger-4 hidden sm:block'>
            <MockDashboard />
          </div>
        </div>
      </section>

      {/* ═══════════ PIPELINE ═══════════ */}
      <section>
        <div className='stagger-5 text-center'>
          <h2 className='text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl'>
            From release notes to verdict
          </h2>
          <p className='mx-auto mt-3 max-w-lg text-base text-gray-500'>
            Four steps. One clear decision. No more shipping blind.
          </p>
        </div>

        {/* Desktop flow */}
        <div className='relative mt-14 hidden lg:block'>
          {/* Connector line */}
          <div className='flow-line absolute left-[12.5%] right-[12.5%] top-8 h-[2px] bg-gradient-to-r from-gray-200 via-indigo-300 to-gray-200'>
            <span className='flow-dot' />
            <span className='flow-dot' style={{ animationDelay: '1.5s' }} />
          </div>

          <div className='grid grid-cols-4'>
            {STEPS.map((step) => {
              const Icon = step.icon
              return (
                <div
                  key={step.number}
                  className='relative flex flex-col items-center px-6 text-center'
                >
                  <div className='z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25 ring-4 ring-gray-50'>
                    <Icon className='h-6 w-6' />
                  </div>
                  <span className='mt-5 text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600'>
                    Step {step.number}
                  </span>
                  <h3 className='mt-1.5 text-base font-semibold text-gray-900'>
                    {step.title}
                  </h3>
                  <p className='mx-auto mt-2 max-w-[210px] text-sm leading-relaxed text-gray-500'>
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile flow */}
        <div className='mt-10 lg:hidden'>
          {STEPS.map((step, i) => {
            const Icon = step.icon
            return (
              <div key={step.number} className='flex gap-4'>
                <div className='flex flex-col items-center'>
                  <div className='z-10 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'>
                    <Icon className='h-5 w-5' />
                  </div>
                  {i < STEPS.length - 1 ? (
                    <div className='my-1.5 w-px flex-1 bg-gradient-to-b from-indigo-300 to-transparent' />
                  ) : null}
                </div>
                <div className='pb-10 pt-2'>
                  <span className='text-[11px] font-bold uppercase tracking-[0.15em] text-indigo-600'>
                    Step {step.number}
                  </span>
                  <h3 className='mt-1 text-sm font-semibold text-gray-900'>
                    {step.title}
                  </h3>
                  <p className='mt-1 text-sm leading-relaxed text-gray-500'>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className='pb-4 text-center'>
        <p className='text-lg font-medium text-gray-600'>
          Ready to run your first pre-mortem?
        </p>
        <Link
          href='/releases/new'
          className='group mt-4 inline-flex items-center gap-2 text-base font-semibold text-indigo-600 transition-colors hover:text-indigo-500'
        >
          Create your first release
          <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
        </Link>
      </section>
    </div>
  )
}
