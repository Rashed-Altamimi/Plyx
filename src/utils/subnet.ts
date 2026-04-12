export interface SubnetInfo {
  network: string
  broadcast: string
  netmask: string
  wildcard: string
  firstHost: string
  lastHost: string
  totalAddresses: number
  usableHosts: number
  cidr: number
}

function ipToInt(ip: string): number {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => isNaN(p) || p < 0 || p > 255)) {
    throw new Error('Invalid IP')
  }
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0
}

function intToIp(n: number): string {
  return [(n >>> 24) & 0xff, (n >>> 16) & 0xff, (n >>> 8) & 0xff, n & 0xff].join('.')
}

export function parseCidr(cidr: string): SubnetInfo | null {
  const match = cidr.trim().match(/^(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\/(\d{1,2})$/)
  if (!match) return null
  const [, ip, prefixStr] = match
  const prefix = parseInt(prefixStr, 10)
  if (prefix < 0 || prefix > 32) return null

  try {
    const ipInt = ipToInt(ip)
    const netmask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
    const wildcard = (~netmask) >>> 0
    const network = (ipInt & netmask) >>> 0
    const broadcast = (network | wildcard) >>> 0
    const totalAddresses = prefix === 32 ? 1 : Math.pow(2, 32 - prefix)
    const usableHosts = prefix >= 31 ? 0 : totalAddresses - 2

    return {
      network: intToIp(network),
      broadcast: intToIp(broadcast),
      netmask: intToIp(netmask),
      wildcard: intToIp(wildcard),
      firstHost: usableHosts > 0 ? intToIp(network + 1) : intToIp(network),
      lastHost: usableHosts > 0 ? intToIp(broadcast - 1) : intToIp(broadcast),
      totalAddresses,
      usableHosts,
      cidr: prefix,
    }
  } catch {
    return null
  }
}
