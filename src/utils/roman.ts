const ROMAN_MAP: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'],  [90, 'XC'],  [50, 'L'],  [40, 'XL'],
  [10, 'X'],   [9, 'IX'],   [5, 'V'],   [4, 'IV'],
  [1, 'I'],
]

export function arabicToRoman(n: number): string | null {
  if (!Number.isInteger(n) || n < 1 || n > 3999) return null
  let result = ''
  let remaining = n
  for (const [value, numeral] of ROMAN_MAP) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  return result
}

export function romanToArabic(s: string): number | null {
  if (!s) return null
  const upper = s.toUpperCase().trim()
  if (!/^[MDCLXVI]+$/.test(upper)) return null
  const values: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 }
  let result = 0
  for (let i = 0; i < upper.length; i++) {
    const current = values[upper[i]]
    const next = values[upper[i + 1]]
    if (next && current < next) {
      result += next - current
      i++
    } else {
      result += current
    }
  }
  // Validate by roundtripping
  if (arabicToRoman(result) !== upper) return null
  return result
}
