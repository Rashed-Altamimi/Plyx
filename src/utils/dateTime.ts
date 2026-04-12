import { format, parse, fromUnixTime, getUnixTime, isValid } from 'date-fns'
import { toZonedTime, fromZonedTime, formatInTimeZone } from 'date-fns-tz'

export const DATE_FORMATS = [
  { label: 'ISO 8601',   pattern: "yyyy-MM-dd'T'HH:mm:ss",  example: '2024-03-15T14:30:00' },
  { label: 'US',         pattern: 'MM/dd/yyyy hh:mm a',      example: '03/15/2024 02:30 PM' },
  { label: 'European',   pattern: 'dd/MM/yyyy HH:mm',        example: '15/03/2024 14:30' },
  { label: 'Long',       pattern: 'MMMM d, yyyy h:mm a',     example: 'March 15, 2024 2:30 PM' },
  { label: 'Date only',  pattern: 'yyyy-MM-dd',              example: '2024-03-15' },
  { label: 'RFC 2822',   pattern: 'EEE, dd MMM yyyy HH:mm:ss xx', example: 'Fri, 15 Mar 2024 14:30:00 +0000' },
]

export function getTimezones(): string[] {
  try {
    return Intl.supportedValuesOf('timeZone')
  } catch {
    return ['UTC', 'America/New_York', 'Europe/London', 'Asia/Tokyo']
  }
}

export function getTimezoneGroups(): Record<string, string[]> {
  const zones = getTimezones()
  const groups: Record<string, string[]> = { Other: [] }
  for (const tz of zones) {
    const slash = tz.indexOf('/')
    if (slash === -1) {
      groups['Other'].push(tz)
    } else {
      const region = tz.slice(0, slash)
      if (!groups[region]) groups[region] = []
      groups[region].push(tz)
    }
  }
  return groups
}

export function convertTimezone(
  dateStr: string,
  fromTz: string,
  toTz: string,
): string {
  try {
    const localDate = new Date(dateStr)
    if (!isValid(localDate)) return 'Invalid date'
    const utc = fromZonedTime(localDate, fromTz)
    return formatInTimeZone(utc, toTz, "yyyy-MM-dd HH:mm:ss zzz")
  } catch {
    return 'Conversion error'
  }
}

export function unixToDate(unix: number): string {
  try {
    const d = fromUnixTime(unix)
    return format(d, "yyyy-MM-dd HH:mm:ss 'UTC'")
  } catch {
    return 'Invalid timestamp'
  }
}

export function dateToUnix(dateStr: string): number | null {
  const d = new Date(dateStr)
  if (!isValid(d)) return null
  return getUnixTime(d)
}

export function convertFormat(input: string, fromPattern: string, toPattern: string): string {
  try {
    const parsed = parse(input, fromPattern, new Date())
    if (!isValid(parsed)) return 'Invalid date'
    return format(parsed, toPattern)
  } catch {
    return 'Conversion error'
  }
}

export function formatAllFormats(dateStr: string): Array<{ label: string; value: string }> {
  const d = new Date(dateStr)
  if (!isValid(d)) return DATE_FORMATS.map(f => ({ label: f.label, value: 'Invalid date' }))
  return DATE_FORMATS.map(f => {
    try {
      return { label: f.label, value: format(d, f.pattern) }
    } catch {
      return { label: f.label, value: '—' }
    }
  })
}

export function toZoned(date: Date, tz: string): Date {
  return toZonedTime(date, tz)
}
