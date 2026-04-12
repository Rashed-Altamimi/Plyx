import Papa from 'papaparse'

export type ImageFormat = 'image/png' | 'image/jpeg' | 'image/webp'
export type DataFormat = 'json' | 'csv' | 'xml'

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
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try { JSON.parse(trimmed); return 'json' } catch { /* not json */ }
  }
  if (trimmed.startsWith('<')) return 'xml'
  if (trimmed.length > 0) return 'csv'
  return null
}

export function csvToJson(csv: string): string {
  const result = Papa.parse(csv, { header: true, skipEmptyLines: true })
  return JSON.stringify(result.data, null, 2)
}

export function jsonToCsv(json: string): string {
  const data = JSON.parse(json)
  const arr = Array.isArray(data) ? data : [data]
  return Papa.unparse(arr)
}

export function jsonToXml(json: string, rootTag = 'root', itemTag = 'item'): string {
  const data = JSON.parse(json)
  const arr = Array.isArray(data) ? data : [data]
  const lines: string[] = [`<?xml version="1.0" encoding="UTF-8"?>`, `<${rootTag}>`]
  for (const item of arr) {
    lines.push(`  <${itemTag}>`)
    for (const [key, val] of Object.entries(item ?? {})) {
      const escaped = String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      lines.push(`    <${key}>${escaped}</${key}>`)
    }
    lines.push(`  </${itemTag}>`)
  }
  lines.push(`</${rootTag}>`)
  return lines.join('\n')
}

export function xmlToJson(xml: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(xml, 'application/xml')
  const parserError = doc.querySelector('parsererror')
  if (parserError) throw new Error('Invalid XML: ' + parserError.textContent)
  return JSON.stringify(nodeToObject(doc.documentElement), null, 2)
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

export function csvToXml(csv: string): string {
  return jsonToXml(csvToJson(csv))
}

export function xmlToCsv(xml: string): string {
  return jsonToCsv(xmlToJson(xml))
}

export function convertData(input: string, from: DataFormat, to: DataFormat): string {
  if (from === to) return input
  if (from === 'csv'  && to === 'json') return csvToJson(input)
  if (from === 'json' && to === 'csv')  return jsonToCsv(input)
  if (from === 'json' && to === 'xml')  return jsonToXml(input)
  if (from === 'xml'  && to === 'json') return xmlToJson(input)
  if (from === 'csv'  && to === 'xml')  return csvToXml(input)
  if (from === 'xml'  && to === 'csv')  return xmlToCsv(input)
  return input
}
