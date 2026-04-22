export interface PasswordOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  numbers: boolean
  symbols: boolean
}

const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const NUMBERS = '0123456789'
const SYMBOLS = '!@#$%^&*()_+-=[]{}|;:,.<>?'

export function generatePassword(options: PasswordOptions): string {
  let charset = ''
  const required: string[] = []

  if (options.uppercase) { charset += UPPERCASE; required.push(pick(UPPERCASE)) }
  if (options.lowercase) { charset += LOWERCASE; required.push(pick(LOWERCASE)) }
  if (options.numbers)   { charset += NUMBERS;   required.push(pick(NUMBERS)) }
  if (options.symbols)   { charset += SYMBOLS;   required.push(pick(SYMBOLS)) }

  if (!charset) return ''

  const arr = new Uint32Array(options.length)
  crypto.getRandomValues(arr)

  const password = Array.from(arr, (n) => charset[n % charset.length])

  // Ensure at least one char from each required set
  required.forEach((char, i) => {
    const pos = i % options.length
    password[pos] = char
  })

  // Shuffle
  for (let i = password.length - 1; i > 0; i--) {
    const j = Math.floor((crypto.getRandomValues(new Uint32Array(1))[0] / 0xFFFFFFFF) * (i + 1))
    ;[password[i], password[j]] = [password[j], password[i]]
  }

  return password.join('')
}

function pick(charset: string): string {
  const idx = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length
  return charset[idx]
}

export function getStrength(password: string): 0 | 1 | 2 | 3 | 4 {
  if (!password) return 0
  let score = 0
  if (password.length >= 8)  score++
  if (password.length >= 16) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(4, score) as 0 | 1 | 2 | 3 | 4
}

export const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong']
export const STRENGTH_COLORS = ['', 'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-500']

/**
 * Estimate entropy in bits for a character-based password, assuming uniform
 * selection from the active charset. This is an upper bound for truly random
 * passwords and an approximation for user-chosen ones.
 */
export function passwordEntropy(password: string, options?: PasswordOptions): number {
  if (!password) return 0
  let size = 0
  if (options) {
    if (options.uppercase) size += 26
    if (options.lowercase) size += 26
    if (options.numbers) size += 10
    if (options.symbols) size += SYMBOLS.length
  } else {
    if (/[A-Z]/.test(password)) size += 26
    if (/[a-z]/.test(password)) size += 26
    if (/[0-9]/.test(password)) size += 10
    if (/[^A-Za-z0-9]/.test(password)) size += SYMBOLS.length
  }
  if (size === 0) return 0
  return password.length * Math.log2(size)
}

export interface PassphraseOptions {
  words: number
  separator: string
  capitalize: boolean
  includeNumber: boolean
}

export function generatePassphrase(wordlist: string[], options: PassphraseOptions): string {
  if (wordlist.length === 0 || options.words <= 0) return ''
  const picked: string[] = []
  const buf = new Uint32Array(options.words)
  crypto.getRandomValues(buf)
  for (let i = 0; i < options.words; i++) {
    let w = wordlist[buf[i] % wordlist.length]
    if (options.capitalize) w = w.charAt(0).toUpperCase() + w.slice(1)
    picked.push(w)
  }
  if (options.includeNumber) {
    const digit = String(crypto.getRandomValues(new Uint32Array(1))[0] % 10)
    const pos = crypto.getRandomValues(new Uint32Array(1))[0] % (picked.length + 1)
    picked.splice(pos, 0, digit)
  }
  return picked.join(options.separator)
}

export function passphraseEntropy(wordlistSize: number, words: number, includeNumber: boolean): number {
  if (wordlistSize <= 0 || words <= 0) return 0
  let bits = words * Math.log2(wordlistSize)
  if (includeNumber) bits += Math.log2(10 * (words + 1))
  return bits
}
