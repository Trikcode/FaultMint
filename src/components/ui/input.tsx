import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, id, className, ...props }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className='space-y-1.5'>
        <label
          htmlFor={inputId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={
            error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
          }
          className={cn(
            'block w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-colors',
            'focus-ring',
            error
              ? 'border-red-300 focus:border-red-400'
              : 'border-gray-300 focus:border-indigo-400',
            className,
          )}
          {...props}
        />
        {error ? (
          <p
            id={`${inputId}-error`}
            className='text-xs text-red-600'
            role='alert'
          >
            {error}
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className='text-xs text-gray-500'>
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'
