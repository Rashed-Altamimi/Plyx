const NAMED_ENTITIES: Record<string, string> = {
  '&': 'amp', '<': 'lt', '>': 'gt', '"': 'quot', "'": 'apos',
  ' ': 'nbsp', '¢': 'cent', '£': 'pound', '¥': 'yen', '€': 'euro',
  '©': 'copy', '®': 'reg', '™': 'trade', '§': 'sect', '¶': 'para',
  '«': 'laquo', '»': 'raquo', '×': 'times', '÷': 'divide',
  '°': 'deg', '±': 'plusmn', '¼': 'frac14', '½': 'frac12', '¾': 'frac34',
  '…': 'hellip', '–': 'ndash', '—': 'mdash',
  '‘': 'lsquo', '’': 'rsquo', '“': 'ldquo', '”': 'rdquo',
  '•': 'bull', '†': 'dagger', '‡': 'Dagger',
  '←': 'larr', '→': 'rarr', '↑': 'uarr', '↓': 'darr', '↔': 'harr',
  '∀': 'forall', '∂': 'part', '∃': 'exist', '∅': 'empty', '∇': 'nabla',
  '∈': 'isin', '∉': 'notin', '∋': 'ni', '∏': 'prod', '∑': 'sum',
  '∞': 'infin', '∧': 'and', '∨': 'or', '∩': 'cap', '∪': 'cup',
  '≈': 'asymp', '≠': 'ne', '≡': 'equiv', '≤': 'le', '≥': 'ge',
}

const REVERSE_NAMED: Record<string, string> = Object.fromEntries(
  Object.entries(NAMED_ENTITIES).map(([k, v]) => [v, k])
)

export type EncodeMode = 'named' | 'numeric' | 'hex'

export function encodeHtmlEntities(text: string, mode: EncodeMode): string {
  let result = ''
  for (const char of text) {
    const code = char.codePointAt(0)!
    if (code < 0x20 || code === 0x7f) {
      // control char — encode numerically
      result += `&#${code};`
      continue
    }
    if (code > 127 || ['<', '>', '&', '"', "'"].includes(char)) {
      if (mode === 'named' && NAMED_ENTITIES[char]) {
        result += `&${NAMED_ENTITIES[char]};`
      } else if (mode === 'hex') {
        result += `&#x${code.toString(16).toUpperCase()};`
      } else {
        result += `&#${code};`
      }
    } else {
      result += char
    }
  }
  return result
}

export function decodeHtmlEntities(text: string): string {
  return text.replace(/&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      return String.fromCodePoint(parseInt(entity.slice(2), 16))
    }
    if (entity.startsWith('#')) {
      return String.fromCodePoint(parseInt(entity.slice(1), 10))
    }
    if (REVERSE_NAMED[entity]) {
      return REVERSE_NAMED[entity]
    }
    return match
  })
}
