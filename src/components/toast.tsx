'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

interface ToastContainerProps {
  toasts: ToastItem[]
  onRemove: (id: string) => void
}

const TOAST_DURATION = 4000

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-white border-indigo-200 text-gray-900',
  success: 'bg-white border-green-300 text-gray-900',
  warning: 'bg-white border-yellow-300 text-gray-900',
  error: 'bg-white border-red-300 text-gray-900',
}

const variantIcons: Record<ToastVariant, React.ReactNode> = {
  info: <Info className='h-4 w-4 text-indigo-500' />,
  success: <CheckCircle2 className='h-4 w-4 text-green-500' />,
  warning: <AlertCircle className='h-4 w-4 text-yellow-500' />,
  error: <XCircle className='h-4 w-4 text-red-500' />,
}

function ToastMessage({
  toast,
  onRemove,
}: {
  toast: ToastItem
  onRemove: (id: string) => void
}) {
  const [exiting, setExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true)
    }, TOAST_DURATION)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (exiting) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, 200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [exiting, onRemove, toast.id])

  return (
    <div
      role='alert'
      aria-live='polite'
      className={cn(
        'pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-lg border px-4 py-3 shadow-lg',
        variantStyles[toast.variant],
        exiting ? 'animate-toast-out' : 'animate-toast-in',
      )}
    >
      <span className='flex-shrink-0'>{variantIcons[toast.variant]}</span>
      <p className='flex-1 text-sm font-medium'>{toast.message}</p>
      <button
        onClick={() => setExiting(true)}
        className='flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-gray-600 focus-ring'
        aria-label='Dismiss notification'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null

  return (
    <div
      aria-label='Notifications'
      className='pointer-events-none fixed bottom-0 right-0 z-50 flex flex-col items-end gap-2 p-4'
    >
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
