import type { SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
}

export function Select({ label, error, className = '', id, children, ...props }: SelectProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-medium text-base-content/60 tracking-wide">
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={`w-full rounded-lg border border-base-content/10 bg-base-100/60 px-3 py-2 text-sm text-base-content outline-none transition-[border-color,box-shadow] focus:border-primary/60 focus:ring-[3px] focus:ring-primary/20 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
