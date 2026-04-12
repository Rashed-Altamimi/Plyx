export function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false
  if (n === 2 || n === 3) return true
  if (n % 2 === 0 || n % 3 === 0) return false
  const limit = Math.floor(Math.sqrt(n))
  for (let i = 5; i <= limit; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false
  }
  return true
}

export function primeFactors(n: number): number[] {
  if (!Number.isInteger(n) || n < 2) return []
  const factors: number[] = []
  let x = n
  for (let i = 2; i * i <= x; i++) {
    while (x % i === 0) {
      factors.push(i)
      x = x / i
    }
  }
  if (x > 1) factors.push(x)
  return factors
}

export function formatFactors(factors: number[]): string {
  if (factors.length === 0) return ''
  // Group into powers: [2,2,3] → "2² × 3"
  const counts = new Map<number, number>()
  for (const f of factors) counts.set(f, (counts.get(f) ?? 0) + 1)
  const superscripts: Record<string, string> = { '0': '⁰','1':'¹','2':'²','3':'³','4':'⁴','5':'⁵','6':'⁶','7':'⁷','8':'⁸','9':'⁹' }
  return Array.from(counts.entries())
    .map(([base, power]) => {
      if (power === 1) return String(base)
      const pow = String(power).split('').map(d => superscripts[d]).join('')
      return `${base}${pow}`
    })
    .join(' × ')
}
