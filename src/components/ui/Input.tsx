import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-base-content/70">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content placeholder-base-content/40 outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20 ${error ? 'border-red-400' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
