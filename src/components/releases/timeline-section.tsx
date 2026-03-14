'use client'

import { cn, formatDateTime } from '@/lib/utils'
import {
  Plus,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Circle,
  UserCheck,
  ArrowRight,
  AlertTriangle,
  Clock,
} from 'lucide-react'

interface TimelineEvent {
  id: string
  type: string
  message: string
  createdAt: string
}

interface TimelineSectionProps {
  events: TimelineEvent[]
}

const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
  CREATED: {
    icon: <Plus className='h-3.5 w-3.5' />,
    color: 'bg-indigo-100 text-indigo-600',
  },
  ANALYZED: {
    icon: <Sparkles className='h-3.5 w-3.5' />,
    color: 'bg-purple-100 text-purple-600',
  },
  RISK_RESOLVED: {
    icon: <ShieldCheck className='h-3.5 w-3.5' />,
    color: 'bg-green-100 text-green-600',
  },
  RISK_UNRESOLVED: {
    icon: <ShieldAlert className='h-3.5 w-3.5' />,
    color: 'bg-red-100 text-red-600',
  },
  CHECKLIST_COMPLETED: {
    icon: <CheckCircle2 className='h-3.5 w-3.5' />,
    color: 'bg-green-100 text-green-600',
  },
  CHECKLIST_UNCHECKED: {
    icon: <Circle className='h-3.5 w-3.5' />,
    color: 'bg-yellow-100 text-yellow-600',
  },
  APPROVAL_UPDATED: {
    icon: <UserCheck className='h-3.5 w-3.5' />,
    color: 'bg-blue-100 text-blue-600',
  },
  STATUS_CHANGED: {
    icon: <ArrowRight className='h-3.5 w-3.5' />,
    color: 'bg-orange-100 text-orange-600',
  },
  VERDICT_CHANGED: {
    icon: <AlertTriangle className='h-3.5 w-3.5' />,
    color: 'bg-amber-100 text-amber-600',
  },
}

const defaultConfig = {
  icon: <Clock className='h-3.5 w-3.5' />,
  color: 'bg-gray-100 text-gray-500',
}

function EmptyTimeline() {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
        <Clock className='h-6 w-6 text-gray-400' />
      </div>
      <p className='mt-3 text-sm font-medium text-gray-700'>No events yet</p>
      <p className='mt-1 text-xs text-gray-500'>
        Events will appear here as actions are performed on this release.
      </p>
    </div>
  )
}

export function TimelineSection({ events }: TimelineSectionProps) {
  if (events.length === 0) {
    return <EmptyTimeline />
  }

  const reversed = [...events].reverse()

  return (
    <div className='relative space-y-0'>
      <div className='absolute left-[17px] top-3 bottom-3 w-px bg-gray-200' />

      {reversed.map((event, index) => {
        const config = typeConfig[event.type] ?? defaultConfig
        const isFirst = index === 0

        return (
          <div key={event.id} className='relative flex gap-4 pb-5 last:pb-0'>
            <div
              className={cn(
                'relative z-10 flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-full',
                config.color,
                isFirst && 'ring-2 ring-white',
              )}
            >
              {config.icon}
            </div>

            <div className='min-w-0 pt-1'>
              <p
                className={cn(
                  'text-sm',
                  isFirst ? 'font-medium text-gray-900' : 'text-gray-700',
                )}
              >
                {event.message}
              </p>
              <p className='mt-0.5 text-xs text-gray-400'>
                {formatDateTime(event.createdAt)}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
