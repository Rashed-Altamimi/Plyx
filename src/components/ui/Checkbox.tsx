import type { InputHTMLAttributes } from 'react'

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, id, className = '', ...props }: CheckboxProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <label htmlFor={inputId} className={`flex items-center gap-3 cursor-pointer group ${className}`}>
      <input
        id={inputId}
        type="checkbox"
        className="w-4 h-4 rounded border-base-content/20 text-primary focus:ring-blue-500 cursor-pointer"
        {...props}
      />
      <span className="text-sm text-base-content/70 group-hover:text-base-content">{label}</span>
    </label>
  )
}
