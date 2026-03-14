import { forwardRef } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface SelectOption {
  value: string
  label: string
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  placeholder?: string
  error?: string
  hint?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    { label, options, placeholder, error, hint, id, className, ...props },
    ref,
  ) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className='space-y-1.5'>
        <label
          htmlFor={inputId}
          className='block text-sm font-medium text-gray-700'
        >
          {label}
        </label>
        <div className='relative'>
          <select
            ref={ref}
            id={inputId}
            aria-invalid={error ? 'true' : undefined}
            aria-describedby={
              error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined
            }
            className={cn(
              'block w-full appearance-none rounded-lg border bg-white py-2 pl-3 pr-9 text-sm text-gray-900 shadow-sm transition-colors',
              'focus-ring',
              error
                ? 'border-red-300 focus:border-red-400'
                : 'border-gray-300 focus:border-indigo-400',
              className,
            )}
            {...props}
          >
            {placeholder ? (
              <option value='' disabled>
                {placeholder}
              </option>
            ) : null}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className='pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5'>
            <ChevronDown className='h-4 w-4 text-gray-400' />
          </div>
        </div>
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

Select.displayName = 'Select'
