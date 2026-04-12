import { useRef, useState, type DragEvent, type ChangeEvent } from 'react'
import { Upload } from 'lucide-react'

interface FileDropzoneProps {
  accept?: string
  onFile: (file: File) => void
  label?: string
  hint?: string
}

export function FileDropzone({ accept, onFile, label = 'Drop file here', hint }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onFile(file)
    e.target.value = ''
  }

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors ${
        dragging ? 'border-primary/60 bg-primary/10' : 'border-base-300 bg-base-200 hover:border-base-content/20 hover:bg-base-100'
      }`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      <Upload size={24} className="text-base-content/40" />
      <p className="text-sm font-medium text-base-content/60">{label}</p>
      {hint && <p className="text-xs text-base-content/40">{hint}</p>}
      <p className="text-xs text-base-content/40">or click to browse</p>
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}
