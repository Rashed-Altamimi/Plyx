import { toHijri, toGregorian } from 'hijri-converter'

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
]

export interface HijriDate {
  hy: number
  hm: number
  hd: number
}

export interface GregorianDate {
  gy: number
  gm: number
  gd: number
}

export function gregorianToHijri(gy: number, gm: number, gd: number): HijriDate {
  const result = toHijri(gy, gm, gd)
  return { hy: result.hy, hm: result.hm, hd: result.hd }
}

export function hijriToGregorian(hy: number, hm: number, hd: number): GregorianDate {
  const result = toGregorian(hy, hm, hd)
  return { gy: result.gy, gm: result.gm, gd: result.gd }
}

export function getHijriDaysInMonth(hy: number, hm: number): number {
  // Hijri months alternate 30/29, last month has 30 in leap years
  // Detect by trying day 30 and checking if it converts back correctly
  try {
    const check = hijriToGregorian(hy, hm, 30)
    const backCheck = gregorianToHijri(check.gy, check.gm, check.gd)
    if (backCheck.hm === hm && backCheck.hy === hy) return 30
  } catch { /* ignore */ }
  return 29
}

// English fallback formatters, kept for non-React callers. UI components format
// via i18n (see HijriConverter).
export function formatHijriDate(hy: number, hm: number, hd: number): string {
  const monthName = HIJRI_MONTHS[hm - 1] ?? ''
  return `${hd} ${monthName} ${hy} AH`
}

export function formatGregorianDate(gy: number, gm: number, gd: number): string {
  const d = new Date(gy, gm - 1, gd)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}

export function todayGregorian(): GregorianDate {
  const now = new Date()
  return { gy: now.getFullYear(), gm: now.getMonth() + 1, gd: now.getDate() }
}

export function todayHijri(): HijriDate {
  const { gy, gm, gd } = todayGregorian()
  return gregorianToHijri(gy, gm, gd)
}
