import { parseRows, serializeRows, type DataFormat } from './fileConverter'

/**
 * SheetJS is heavy (~400 KB), so it's pulled in with a dynamic import. That
 * keeps it in its own async chunk — out of the main bundle and the other
 * converters, loaded only when an XLSX conversion actually runs.
 */
function loadXlsx() {
  return import('xlsx')
}

/** Read the first sheet of an XLSX workbook into JSON, CSV, TSV, or XML text. */
export async function xlsxToData(buffer: ArrayBuffer, to: DataFormat, header = true): Promise<string> {
  const XLSX = await loadXlsx()
  const wb = XLSX.read(new Uint8Array(buffer), { type: 'array' })
  const sheetName = wb.SheetNames[0]
  if (!sheetName) throw new Error('The workbook has no sheets')
  const sheet = wb.Sheets[sheetName]
  const rows: unknown[] = header
    ? XLSX.utils.sheet_to_json(sheet)
    : XLSX.utils.sheet_to_json(sheet, { header: 1 })
  return serializeRows(rows, to, header)
}

/** Build a single-sheet XLSX workbook from JSON, CSV, TSV, or XML text. */
export async function dataToXlsx(input: string, from: DataFormat, header = true): Promise<Uint8Array> {
  const XLSX = await loadXlsx()
  const rows = parseRows(input, from, header)
  const sheet = rows.length > 0 && Array.isArray(rows[0])
    ? XLSX.utils.aoa_to_sheet(rows as unknown[][])
    : XLSX.utils.json_to_sheet(rows as object[])
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, 'Sheet1')
  // `write` with type 'array' yields the raw bytes; normalize to a real Uint8Array.
  return new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }))
}
