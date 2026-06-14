import Papa from 'papaparse'

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'
export type DataFormat = 'json' | 'csv' | 'xml' | 'tsv'

export function supportsWebp(): boolean {
  const canvas = document.createElement('canvas')
  canvas.width = 1
  canvas.height = 1
  return canvas.toDataURL('image/webp').startsWith('data:image/webp')
}

export async function convertImage(
  file: File,
  targetFormat: ImageFormat,
  quality = 0.92,
): Promise<{ dataUrl: string; filename: string }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.naturalWidth
      canvas.height = img.naturalHeight
      const ctx = canvas.getContext('2d')!

      // Fill white background for formats that don't support transparency
      if (targetFormat === 'image/jpeg') {
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
      }

      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)

      const dataUrl = canvas.toDataURL(targetFormat, quality)
      const ext = targetFormat === 'image/png' ? 'png'
        : targetFormat === 'image/jpeg' ? 'jpg'
        : 'webp'
      const baseName = file.name.replace(/\.[^.]+$/, '')
      resolve({ dataUrl, filename: `${baseName}.${ext}` })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }
    img.src = url
  })
}

export function detectDataFormat(text: string): DataFormat | null {
  const trimmed = text.trim()
  if (!trimmed) return null
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try { JSON.parse(trimmed); return 'json' } catch { /* not json */ }
  }
  if (trimmed.startsWith('<')) return 'xml'
  const firstLine = trimmed.split('\n', 1)[0]
  if (firstLine.includes('\t')) return 'tsv'
  return 'csv'
}

function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

/** Coerce a column name into a valid XML element name (must start with a letter/underscore). */
function sanitizeXmlTag(name: string, fallback: string): string {
  const cleaned = String(name).trim().replace(/[^A-Za-z0-9_.-]/g, '_')
  return /^[A-Za-z_]/.test(cleaned) ? cleaned : fallback
}

function arrayToXml(rows: unknown[], rootTag = 'root', itemTag = 'item'): string {
  const lines: string[] = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootTag}>`]
  for (const row of rows) {
    lines.push(`  <${itemTag}>`)
    if (Array.isArray(row)) {
      row.forEach((val, i) => lines.push(`    <column_${i + 1}>${escapeXml(val)}</column_${i + 1}>`))
    } else if (row && typeof row === 'object') {
      for (const [key, val] of Object.entries(row)) {
        const tag = sanitizeXmlTag(key, 'field')
        lines.push(`    <${tag}>${escapeXml(val)}</${tag}>`)
      }
    } else {
      lines.push(`    <value>${escapeXml(row)}</value>`)
    }
    lines.push(`  </${itemTag}>`)
  }
  lines.push(`</${rootTag}>`)
  return lines.join('\n')
}

function nodeToObject(node: Element): unknown {
  const children = Array.from(node.children)
  if (children.length === 0) return node.textContent ?? ''
  const result: Record<string, unknown> = {}
  for (const child of children) {
    const val = nodeToObject(child)
    if (child.tagName in result) {
      if (!Array.isArray(result[child.tagName])) {
        result[child.tagName] = [result[child.tagName]]
      }
      ;(result[child.tagName] as unknown[]).push(val)
    } else {
      result[child.tagName] = val
    }
  }
  return result
}

function xmlToRows(xml: string): unknown[] {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) throw new Error('Invalid XML: ' + parserError.textContent)
  const parsed = nodeToObject(doc.documentElement)
  // A <root><item>…</item></root> document parses to { item: [...] }; unwrap that
  // single wrapper key into the row list. A flat record stays a single row.
  if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const values = Object.values(parsed as Record<string, unknown>)
    if (values.length === 1) {
      const only = values[0]
      return Array.isArray(only) ? only : [only]
    }
  }
  return Array.isArray(parsed) ? parsed : [parsed]
}

/** Parse a text payload into a list of rows (objects when `header`, else string arrays). */
export function parseRows(input: string, format: DataFormat, header: boolean): unknown[] {
  const text = input.trim()
  if (!text) return []
  if (format === 'json') {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : [parsed]
  }
  if (format === 'xml') return xmlToRows(text)
  const result = Papa.parse(text, {
    header,
    skipEmptyLines: true,
    ...(format === 'tsv' ? { delimiter: '\t' } : {}),
  })
  return result.data as unknown[]
}

/** Serialize a list of rows into the target text format. */
export function serializeRows(rows: unknown[], format: DataFormat, header: boolean): string {
  if (format === 'json') return JSON.stringify(rows, null, 2)
  if (format === 'xml') return arrayToXml(rows)
  return Papa.unparse(rows, { header, ...(format === 'tsv' ? { delimiter: '\t' } : {}) })
}

export function convertData(input: string, from: DataFormat, to: DataFormat, header = true): string {
  if (from === to) return input
  return serializeRows(parseRows(input, from, header), to, header)
}
