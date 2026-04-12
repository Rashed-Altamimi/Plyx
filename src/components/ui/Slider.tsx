import type { InputHTMLAttributes } from 'react'

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
  value: number
}

export function Slider({ label, value, id, className = '', ...props }: SliderProps) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={inputId} className="text-sm font-medium text-base-content/70">
          {label}
        </label>
        <span className="text-sm font-mono text-base-content bg-base-300 px-2 py-0.5 rounded">
          {value}
        </span>
      </div>
      <input
        id={inputId}
        type="range"
        value={value}
        className="w-full accent-primary cursor-pointer"
        {...props}
      />
    </div>
  )
}
