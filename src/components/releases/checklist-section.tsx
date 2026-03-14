'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Check, Circle, Loader2, ListChecks } from 'lucide-react'

interface ChecklistItem {
  id: string
  title: string
  completed: boolean
}

interface ChecklistSectionProps {
  items: ChecklistItem[]
  onToggle: (itemId: string) => Promise<void>
}

function ChecklistRow({
  item,
  onToggle,
}: {
  item: ChecklistItem
  onToggle: (itemId: string) => Promise<void>
}) {
  const [toggling, setToggling] = useState(false)

  async function handleToggle() {
    setToggling(true)
    await onToggle(item.id)
    setToggling(false)
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
        item.completed
          ? 'border-green-100 bg-green-50/50'
          : 'border-gray-200 bg-white',
      )}
    >
      <button
        onClick={handleToggle}
        disabled={toggling}
        className={cn(
          'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors focus-ring',
          item.completed
            ? 'border-green-500 bg-green-500 text-white'
            : 'border-gray-300 bg-white text-transparent hover:border-gray-400',
        )}
        data-testid={`checklist-toggle-${item.id}`}
        aria-label={
          item.completed
            ? `Mark "${item.title}" as incomplete`
            : `Mark "${item.title}" as complete`
        }
      >
        {toggling ? (
          <Loader2 className='h-3 w-3 animate-spin text-gray-400' />
        ) : item.completed ? (
          <Check className='h-3 w-3' />
        ) : (
          <Circle className='h-3 w-3' />
        )}
      </button>

      <span
        className={cn(
          'text-sm',
          item.completed
            ? 'text-gray-500 line-through'
            : 'text-gray-900 font-medium',
        )}
      >
        {item.title}
      </span>
    </div>
  )
}

function EmptyChecklist() {
  return (
    <div className='flex flex-col items-center justify-center py-8 text-center'>
      <div className='flex h-12 w-12 items-center justify-center rounded-full bg-gray-100'>
        <ListChecks className='h-6 w-6 text-gray-400' />
      </div>
      <p className='mt-3 text-sm font-medium text-gray-700'>
        No checklist items
      </p>
      <p className='mt-1 text-xs text-gray-500'>
        Run analysis to generate mitigation checklist items.
      </p>
    </div>
  )
}

export function ChecklistSection({ items, onToggle }: ChecklistSectionProps) {
  if (items.length === 0) {
    return <EmptyChecklist />
  }

  const sorted = [...items].sort((a, b) => {
    const aCompleted = a.completed ? 1 : 0
    const bCompleted = b.completed ? 1 : 0
    return aCompleted - bCompleted
  })

  const completedCount = items.filter((i) => i.completed).length
  const progress =
    items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0

  return (
    <div className='space-y-4'>
      <div className='space-y-1.5'>
        <div className='flex items-center justify-between text-xs text-gray-500'>
          <span>
            {completedCount} of {items.length} completed
          </span>
          <span>{progress}%</span>
        </div>
        <div className='h-2 overflow-hidden rounded-full bg-gray-100'>
          <div
            className='h-full rounded-full bg-green-500 transition-all duration-300'
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className='space-y-2'>
        {sorted.map((item) => (
          <ChecklistRow key={item.id} item={item} onToggle={onToggle} />
        ))}
      </div>
    </div>
  )
}
