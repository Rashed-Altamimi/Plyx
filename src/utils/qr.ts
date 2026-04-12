export type QrTab = 'url' | 'text' | 'wifi' | 'vcard'

export interface WifiData {
  ssid: string
  password: string
  security: 'WPA' | 'WEP' | 'nopass'
  hidden: boolean
}

export interface VCardData {
  firstName: string
  lastName: string
  phone: string
  email: string
  url: string
  organization: string
}

export function buildWifiString(data: WifiData): string {
  const hidden = data.hidden ? 'H:true;' : ''
  return `WIFI:S:${escapeWifi(data.ssid)};T:${data.security};P:${escapeWifi(data.password)};${hidden};`
}

export function buildVCardString(data: VCardData): string {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  const name = [data.lastName, data.firstName].filter(Boolean).join(';')
  if (name) lines.push(`N:${name}`)
  const fn = [data.firstName, data.lastName].filter(Boolean).join(' ')
  if (fn) lines.push(`FN:${fn}`)
  if (data.organization) lines.push(`ORG:${data.organization}`)
  if (data.phone) lines.push(`TEL:${data.phone}`)
  if (data.email) lines.push(`EMAIL:${data.email}`)
  if (data.url) lines.push(`URL:${data.url}`)
  lines.push('END:VCARD')
  return lines.join('\n')
}

function escapeWifi(str: string): string {
  return str.replace(/[\\;,"]/g, (c) => `\\${c}`)
}
