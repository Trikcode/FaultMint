'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { cn, severityColor } from '@/lib/utils'
import {
  ShieldAlert,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'

interface Risk {
  id: string
  title: string
  description: string
  severity: string
  resolved: boolean
}

interface RiskListProps {
  risks: Risk[]
  onToggle: (riskId: string) => Promise<void>
}

function RiskItem({
  risk,
  onToggle,
}: {
  risk: Risk
  onToggle: (riskId: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    await onToggle(risk.id)
    setToggling(false)
  }

  return (
    <div
      className={cn(
        'rounded-lg border transition-colors',
        risk.resolved
          ? 'border-gray-200 bg-gray-50'
          : 'border-gray-200 bg-white',
      )}
    >
      <div className='flex items-start gap-3 p-4'>
        <button
          onClick={handleToggle}
          disabled={toggling}
          className={cn(
            'mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border transition-colors focus-ring',
            risk.resolved
              ? 'border-green-300 bg-green-50 text-green-600 hover:bg-green-100'
              : 'border-gray-300 bg-white text-gray-400 hover:bg-gray-50 hover:text-gray-600',
          )}
          data-testid={`risk-toggle-${risk.id}`}
          aria-label={
            risk.resolved
              ? `Mark risk "${risk.title}" as unresolved`
              : `Mark risk "${risk.title}" as resolved`
          }
        >
          {toggling ? (
            <Loader2 className='h-3.5 w-3.5 animate-spin' />
          ) : risk.resolved ? (
            <ShieldCheck className='h-3.5 w-3.5' />
          ) : (
            <ShieldAlert className='h-3.5 w-3.5' />
          )}
        </button>

        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='custom'
              size='sm'
              className={severityColor(risk.severity)}
            >
              {risk.severity}
            </Badge>
            {risk.resolved ? (
              <Badge variant='success' size='sm'>
                RESOLVED
              </Badge>
            ) : null}
          </div>
          <h4
            className={cn(
              'mt-1.5 text-sm font-medium',
              risk.resolved ? 'text-gray-500 line-through' : 'text-gray-900',
            )}
          >
            {risk.title}
          </h4>
        </div>

        <button
          onClick={() => setExpanded((prev) => !prev)}
          className='flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus-ring'
          aria-label={expanded ? 'Collapse details' : 'Expand details'}
        >
          {expanded ? (
            <ChevronDown className='h-4 w-4' />
          ) : (
            <ChevronRight className='h-4 w-4' />
          )}
        </button>
      </div>

      {expanded ? (
        <div className='border-t border-gray-100 px-4 py-3 pl-[3.25rem]'>
          <p className='text-sm leading-relaxed text-gray-600'>
            {risk.description}
          </p>
        </div>
      ) : null}
    </div>
  )
}

function EmptyRisks() {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-green-50'>
        <ShieldCheck className='h-6 w-6 text-green-400' />
      </div>
      <p className='mt-3 text-sm font-medium text-gray-700'>No risks found</p>
      <p className='mt-1 text-xs text-gray-500'>
        The analysis did not identify any failure risks.
      </p>
    </div>
  )
}

export function RiskList({ risks, onToggle }: RiskListProps) {
  if (risks.length === 0) {
    return <EmptyRisks />
  }

  const severityOrder: Record<string, number> = {
    CRITICAL: 0,
    HIGH: 1,
    MEDIUM: 2,
    LOW: 3,
  }

  const sorted = [...risks].sort((a, b) => {
    const aResolved = a.resolved ? 1 : 0
    const bResolved = b.resolved ? 1 : 0
    if (aResolved !== bResolved) return aResolved - bResolved
    return (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4)
  })

  return (
    <div className='space-y-3'>
      {sorted.map((risk) => (
        <RiskItem key={risk.id} risk={risk} onToggle={onToggle} />
      ))}
    </div>
  )
}
