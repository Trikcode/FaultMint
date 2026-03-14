import Link from 'next/link'
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  cn,
  formatDate,
  statusColor,
  verdictColor,
  riskScoreColor,
} from '@/lib/utils'

interface ReleaseItem {
  id: string
  title: string
  description: string
  status: string
  verdict: string
  riskScore: number
  createdAt: Date
  risks: Array<{ id: string; severity: string; resolved: boolean }>
  checklist: Array<{ id: string; completed: boolean }>
  approvals: Array<{ id: string; role: string; status: string }>
}

interface ReleaseListProps {
  releases: ReleaseItem[]
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

function EmptyState() {
  return (
    <Card padding='none'>
      <div className='flex flex-col items-center justify-center px-6 py-16 text-center'>
        <div className='flex h-14 w-14 items-center justify-center rounded-full bg-gray-100'>
          <Package className='h-7 w-7 text-gray-400' />
        </div>
        <h3 className='mt-4 text-base font-semibold text-gray-900'>
          No releases yet
        </h3>
        <p className='mt-1.5 max-w-sm text-sm text-gray-500'>
          Create your first release to run an AI pre-mortem analysis and get a
          ship-or-block verdict.
        </p>
        <Link
          href='/releases/new'
          className='mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 focus-ring'
        >
          <FileText className='h-4 w-4' />
          Create Release
        </Link>
      </div>
    </Card>
  )
}

function ReleaseCard({ release }: { release: ReleaseItem }) {
  const { version, name } = parseVersionFromTitle(release.title)
  const owner = parseOwnerFromDescription(release.description)
  const unresolvedCount = release.risks.filter((r) => !r.resolved).length
  const completedCount = release.checklist.filter((c) => c.completed).length
  const totalChecklist = release.checklist.length
  const totalRisks = release.risks.length

  return (
    <Link href={`/releases/${release.id}`} className='group block'>
      <Card
        padding='none'
        className='transition-all duration-150 group-hover:card-shadow-hover group-hover:border-gray-300'
      >
        <div className='p-5'>
          <div className='flex items-start justify-between gap-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='custom'
                className={statusColor(release.status)}
                data-testid='release-status-badge'
              >
                {release.status}
              </Badge>
              <Badge
                variant='custom'
                className={verdictColor(release.verdict)}
                data-testid='release-verdict-badge'
              >
                {release.verdict.replace('_', ' ')}
              </Badge>
            </div>
            <span
              className={cn(
                'text-xl font-bold tabular-nums',
                riskScoreColor(release.riskScore),
              )}
            >
              {release.riskScore}
            </span>
          </div>

          <div className='mt-3'>
            {version ? (
              <span className='mb-1 inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600'>
                {version}
              </span>
            ) : null}
            <h3 className='text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors'>
              {name}
            </h3>
            {owner ? (
              <p className='mt-0.5 text-xs text-gray-500'>Owner: {owner}</p>
            ) : null}
          </div>

          <div className='mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500'>
            <span className='inline-flex items-center gap-1'>
              <AlertTriangle className='h-3.5 w-3.5' />
              {totalRisks} risk{totalRisks !== 1 ? 's' : ''}
              {unresolvedCount > 0 ? (
                <span className='text-red-600'>
                  ({unresolvedCount} unresolved)
                </span>
              ) : totalRisks > 0 ? (
                <span className='text-green-600'>(all resolved)</span>
              ) : null}
            </span>

            <span className='inline-flex items-center gap-1'>
              <CheckCircle2 className='h-3.5 w-3.5' />
              {completedCount}/{totalChecklist} items done
            </span>

            <span className='inline-flex items-center gap-1'>
              <Clock className='h-3.5 w-3.5' />
              {formatDate(release.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

export function ReleaseList({ releases }: ReleaseListProps) {
  if (releases.length === 0) {
    return <EmptyState />
  }

  return (
    <div className='grid gap-4 sm:grid-cols-2'>
      {releases.map((release) => (
        <ReleaseCard key={release.id} release={release} />
      ))}
    </div>
  )
}
