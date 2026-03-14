'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { useToast } from '@/components/providers'
import { RiskList } from '@/components/releases/risk-list'
import { ChecklistSection } from '@/components/releases/checklist-section'
import { ApprovalsSection } from '@/components/releases/approvals-section'
import { TimelineSection } from '@/components/releases/timeline-section'
import {
  cn,
  statusColor,
  verdictColor,
  riskScoreColor,
  formatDate,
} from '@/lib/utils'
import {
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Users,
  Loader2,
} from 'lucide-react'

interface Risk {
  id: string
  title: string
  description: string
  severity: string
  resolved: boolean
  releaseId: string
  createdAt: string
  updatedAt: string
}

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
  releaseId: string
  createdAt: string
  updatedAt: string
}

interface Approval {
  id: string
  role: string
  status: string
  comment: string
  releaseId: string
  createdAt: string
  updatedAt: string
}

interface TimelineEvent {
  id: string
  type: string
  message: string
  releaseId: string
  createdAt: string
}

export interface ReleaseDetail {
  id: string
  title: string
  description: string
  releaseNotes: string
  status: string
  verdict: string
  riskScore: number
  createdAt: string
  updatedAt: string
  risks: Risk[]
  checklist: ChecklistItem[]
  approvals: Approval[]
  timeline: TimelineEvent[]
}

interface ReleaseDetailClientProps {
  initialRelease: ReleaseDetail
}

function parseVersionFromTitle(title: string): {
  version: string | null
  name: string
} {
  const match = title.match(
    /^(v\d+\.\d+(?:\.\d+)?(?:-[\w.]+)?)\s*[—–-]\s*(.+)$/,
  )
  if (match && match[1] && match[2]) {
    return { version: match[1], name: match[2] }
  }
  return { version: null, name: title }
}

function parseOwnerFromDescription(description: string): string | null {
  if (!description) return null
  const match = description.match(/^Owner:\s*(.+?)(?:\n|$)/)
  return match && match[1] ? match[1].trim() : null
}

export function ReleaseDetailClient({
  initialRelease,
}: ReleaseDetailClientProps) {
  const [release, setRelease] = useState<ReleaseDetail>(initialRelease)
  const [analyzing, setAnalyzing] = useState(false)
  const [lastAnalyzedAt, setLastAnalyzedAt] = useState<Date | null>(null)
  const { addToast } = useToast()

  const { version, name } = parseVersionFromTitle(release.title)
  const owner = parseOwnerFromDescription(release.description)

  const handleAnalyze = useCallback(async () => {
    if (analyzing) return // Guard against concurrent analysis calls
    setAnalyzing(true)
    try {
      const res = await fetch(`/api/releases/${release.id}/analyze`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        addToast(data.error ?? 'Analysis failed', 'error')
        setAnalyzing(false)
        return
      }

      const updated = (await res.json()) as ReleaseDetail
      setRelease(updated)
      setLastAnalyzedAt(new Date())
      addToast('Analysis complete', 'success')
    } catch {
      addToast('Network error during analysis', 'error')
    }
    setAnalyzing(false)
  }, [analyzing, release.id, addToast])

  const handleRiskToggle = useCallback(
    async (riskId: string) => {
      try {
        const res = await fetch(
          `/api/releases/${release.id}/risks/${riskId}/toggle`,
          { method: 'PATCH' },
        )

        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          addToast(data.error ?? 'Failed to toggle risk', 'error')
          return
        }

        const updated = (await res.json()) as ReleaseDetail
        setRelease(updated)
      } catch {
        addToast('Network error toggling risk', 'error')
      }
    },
    [release.id, addToast],
  )

  const handleChecklistToggle = useCallback(
    async (itemId: string) => {
      try {
        const res = await fetch(
          `/api/releases/${release.id}/checklist/${itemId}/toggle`,
          { method: 'PATCH' },
        )

        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          addToast(data.error ?? 'Failed to toggle checklist item', 'error')
          return
        }

        const updated = (await res.json()) as ReleaseDetail
        setRelease(updated)
      } catch {
        addToast('Network error toggling checklist item', 'error')
      }
    },
    [release.id, addToast],
  )

  const handleApprovalSubmit = useCallback(
    async (role: string, status: string, comment: string) => {
      try {
        const res = await fetch(`/api/releases/${release.id}/approvals`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ role, status, comment }),
        })

        if (!res.ok) {
          const data = (await res.json()) as { error?: string }
          addToast(data.error ?? 'Failed to submit approval', 'error')
          return
        }

        const data = (await res.json()) as { release: ReleaseDetail }
        setRelease(data.release)
        addToast(`${role} approval set to ${status}`, 'success')
      } catch {
        addToast('Network error submitting approval', 'error')
      }
    },
    [release.id, addToast],
  )

  const unresolvedRisks = release.risks.filter((r) => !r.resolved).length
  const completedChecklist = release.checklist.filter((c) => c.completed).length
  const isDraft = release.status === 'DRAFT'

  return (
    <div className='space-y-6 animate-fade-in'>
      {/* Breadcrumb */}
      <Link
        href='/dashboard'
        className='inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900 focus-ring rounded-md'
      >
        <ArrowLeft className='h-3.5 w-3.5' />
        Back to Dashboard
      </Link>

      {/* Header */}
      <Card padding='lg'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='min-w-0 space-y-2'>
            {version ? (
              <span className='inline-block rounded bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'>
                {version}
              </span>
            ) : null}
            <h1 className='text-2xl font-bold tracking-tight text-gray-900'>
              {name}
            </h1>
            {owner ? (
              <p className='text-sm text-gray-500'>Owner: {owner}</p>
            ) : null}
            <p className='text-xs text-gray-400'>
              Created {formatDate(release.createdAt)}
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-3'>
            <Badge
              variant='custom'
              size='md'
              className={cn(statusColor(release.status), 'text-sm px-3 py-1')}
              data-testid='release-status-badge'
            >
              {release.status}
            </Badge>
            <Badge
              variant='custom'
              size='md'
              className={cn(verdictColor(release.verdict), 'text-sm px-3 py-1')}
              data-testid='release-verdict-badge'
            >
              {release.verdict.replace('_', ' ')}
            </Badge>
            <div className='text-center'>
              <div
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  riskScoreColor(release.riskScore),
                )}
              >
                {release.riskScore}
              </div>
              <div className='text-xs text-gray-400'>Risk Score</div>
            </div>
          </div>
        </div>

        <div className='mt-5 border-t border-gray-100 pt-5 flex items-center gap-4'>
          <Button
            onClick={handleAnalyze}
            loading={analyzing}
            icon={analyzing ? undefined : <Sparkles className='h-4 w-4' />}
            data-testid='run-analysis-button'
          >
            {analyzing
              ? 'Analyzing…'
              : isDraft
                ? 'Run Analysis'
                : 'Re-run Analysis'}
          </Button>
          {lastAnalyzedAt ? (
            <span className='text-xs text-gray-400'>
              Last analyzed at {lastAnalyzedAt.toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </Card>

      {/* Release Notes */}
      <Card padding='lg'>
        <CardHeader
          title='Release Notes'
          description='The content that will be analyzed for failure risks'
        />
        <div className='mt-4 rounded-lg border border-gray-100 bg-gray-50 p-4'>
          <pre className='whitespace-pre-wrap text-sm leading-relaxed text-gray-700 font-sans'>
            {release.releaseNotes}
          </pre>
        </div>
      </Card>

      {/* Summary Stats */}
      {!isDraft ? (
        <div className='grid gap-4 sm:grid-cols-4'>
          <Card padding='sm' className='text-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <AlertTriangle className='h-5 w-5 text-gray-400' />
              <span className='text-2xl font-bold text-gray-900'>
                {release.risks.length}
              </span>
              <span className='text-xs text-gray-500'>Total Risks</span>
            </div>
          </Card>
          <Card padding='sm' className='text-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <AlertTriangle className='h-5 w-5 text-red-400' />
              <span className='text-2xl font-bold text-gray-900'>
                {unresolvedRisks}
              </span>
              <span className='text-xs text-gray-500'>Unresolved</span>
            </div>
          </Card>
          <Card padding='sm' className='text-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <CheckCircle2 className='h-5 w-5 text-green-400' />
              <span className='text-2xl font-bold text-gray-900'>
                {completedChecklist}/{release.checklist.length}
              </span>
              <span className='text-xs text-gray-500'>Checklist Done</span>
            </div>
          </Card>
          <Card padding='sm' className='text-center'>
            <div className='flex flex-col items-center gap-1.5'>
              <Users className='h-5 w-5 text-indigo-400' />
              <span className='text-2xl font-bold text-gray-900'>
                {
                  release.approvals.filter((a) => a.status === 'APPROVED')
                    .length
                }
                /3
              </span>
              <span className='text-xs text-gray-500'>Approved</span>
            </div>
          </Card>
        </div>
      ) : null}

      {/* Analysis Loading */}
      {analyzing ? (
        <Card padding='lg'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <Loader2 className='h-8 w-8 animate-spin text-indigo-500' />
            <p className='mt-3 text-sm font-medium text-gray-700'>
              Running AI pre-mortem analysis…
            </p>
            <p className='mt-1 text-xs text-gray-500'>
              Identifying failure risks and generating mitigation checklist
            </p>
          </div>
        </Card>
      ) : null}

      {/* Draft Empty State */}
      {isDraft && !analyzing ? (
        <Card padding='lg'>
          <div className='flex flex-col items-center justify-center py-10 text-center'>
            <div className='flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50'>
              <Sparkles className='h-7 w-7 text-indigo-400' />
            </div>
            <h3 className='mt-4 text-base font-semibold text-gray-900'>
              Ready for analysis
            </h3>
            <p className='mt-1.5 max-w-md text-sm text-gray-500'>
              Click &ldquo;Run Analysis&rdquo; above to identify potential
              failure risks and generate a mitigation checklist from your
              release notes.
            </p>
          </div>
        </Card>
      ) : null}

      {/* Risks */}
      {!isDraft && !analyzing ? (
        <Card padding='lg'>
          <CardHeader
            title='Predicted Risks'
            description={`${release.risks.length} risk${release.risks.length !== 1 ? 's' : ''} identified — ${unresolvedRisks} unresolved`}
          />
          <div className='mt-4'>
            <RiskList risks={release.risks} onToggle={handleRiskToggle} />
          </div>
        </Card>
      ) : null}

      {/* Checklist */}
      {!isDraft && !analyzing ? (
        <Card padding='lg'>
          <CardHeader
            title='Mitigation Checklist'
            description={`${completedChecklist} of ${release.checklist.length} items completed`}
          />
          <div className='mt-4'>
            <ChecklistSection
              items={release.checklist}
              onToggle={handleChecklistToggle}
            />
          </div>
        </Card>
      ) : null}

      {/* Approvals */}
      {!isDraft && !analyzing ? (
        <Card padding='lg'>
          <CardHeader
            title='Approvals'
            description='Collect sign-off from Engineering, QA, and Product'
          />
          <div className='mt-4'>
            <ApprovalsSection
              approvals={release.approvals}
              onSubmit={handleApprovalSubmit}
            />
          </div>
        </Card>
      ) : null}

      {/* Timeline */}
      {release.timeline.length > 0 ? (
        <Card padding='lg'>
          <CardHeader
            title='Timeline'
            description='Chronological record of all release events'
          />
          <div className='mt-4'>
            <TimelineSection events={release.timeline} />
          </div>
        </Card>
      ) : null}
    </div>
  )
}
