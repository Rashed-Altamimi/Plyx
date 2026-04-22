import { faker } from '@faker-js/faker/locale/en'

// ---------------------------------------------------------------------------
// Presets — realistic fake object shapes for common use cases. Each preset is
// a zero-argument function that returns a fresh record each time it is called.
// ---------------------------------------------------------------------------

export type PresetId =
  | 'user'
  | 'address'
  | 'product'
  | 'order'
  | 'company'
  | 'post'
  | 'transaction'
  | 'comment'

export interface Preset {
  id: PresetId
  labelKey: string
  generate: () => Record<string, unknown>
}

const isoDate = (d: Date) => d.toISOString()

export const PRESETS: Preset[] = [
  {
    id: 'user',
    labelKey: 'fakeJson.presets.user',
    generate: () => ({
      id: faker.string.uuid(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      avatar: faker.image.avatar(),
      bio: faker.person.bio(),
      role: faker.helpers.arrayElement(['admin', 'editor', 'viewer']),
      joinedAt: isoDate(faker.date.past({ years: 3 })),
    }),
  },
  {
    id: 'address',
    labelKey: 'fakeJson.presets.address',
    generate: () => ({
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      country: faker.location.country(),
      zip: faker.location.zipCode(),
      latitude: Number(faker.location.latitude()),
      longitude: Number(faker.location.longitude()),
    }),
  },
  {
    id: 'product',
    labelKey: 'fakeJson.presets.product',
    generate: () => ({
      id: faker.string.uuid(),
      sku: faker.string.alphanumeric({ length: 10, casing: 'upper' }),
      name: faker.commerce.productName(),
      description: faker.commerce.productDescription(),
      price: Number(faker.commerce.price()),
      stock: faker.number.int({ min: 0, max: 999 }),
      category: faker.commerce.department(),
      tags: faker.helpers.arrayElements(
        ['new', 'sale', 'popular', 'limited', 'eco', 'premium'],
        { min: 0, max: 3 }
      ),
      createdAt: isoDate(faker.date.past({ years: 2 })),
    }),
  },
  {
    id: 'order',
    labelKey: 'fakeJson.presets.order',
    generate: () => {
      const itemCount = faker.number.int({ min: 1, max: 4 })
      const items = Array.from({ length: itemCount }, () => ({
        productId: faker.string.uuid(),
        name: faker.commerce.productName(),
        quantity: faker.number.int({ min: 1, max: 5 }),
        price: Number(faker.commerce.price()),
      }))
      const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
      return {
        id: faker.string.uuid(),
        customerId: faker.string.uuid(),
        items,
        total: Number(total.toFixed(2)),
        status: faker.helpers.arrayElement(['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
        createdAt: isoDate(faker.date.recent({ days: 30 })),
      }
    },
  },
  {
    id: 'company',
    labelKey: 'fakeJson.presets.company',
    generate: () => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      industry: faker.company.buzzNoun(),
      website: faker.internet.url(),
      headquarters: {
        city: faker.location.city(),
        country: faker.location.country(),
      },
      employees: faker.number.int({ min: 1, max: 100_000 }),
      foundedAt: faker.date.past({ years: 40 }).getFullYear(),
    }),
  },
  {
    id: 'post',
    labelKey: 'fakeJson.presets.post',
    generate: () => ({
      id: faker.string.uuid(),
      title: faker.lorem.sentence({ min: 3, max: 7 }),
      slug: faker.lorem.slug(),
      body: faker.lorem.paragraphs(2, '\n\n'),
      author: faker.person.fullName(),
      tags: faker.helpers.arrayElements(['tech', 'design', 'news', 'opinion', 'guide', 'tutorial'], { min: 1, max: 3 }),
      publishedAt: isoDate(faker.date.past({ years: 1 })),
      views: faker.number.int({ min: 0, max: 50_000 }),
    }),
  },
  {
    id: 'transaction',
    labelKey: 'fakeJson.presets.transaction',
    generate: () => ({
      id: faker.string.uuid(),
      amount: Number(faker.finance.amount()),
      currency: faker.finance.currencyCode(),
      type: faker.helpers.arrayElement(['deposit', 'withdrawal', 'transfer', 'refund']),
      status: faker.helpers.arrayElement(['pending', 'completed', 'failed']),
      date: isoDate(faker.date.recent({ days: 90 })),
      description: faker.finance.transactionDescription(),
    }),
  },
  {
    id: 'comment',
    labelKey: 'fakeJson.presets.comment',
    generate: () => ({
      id: faker.string.uuid(),
      postId: faker.string.uuid(),
      author: faker.internet.username(),
      body: faker.lorem.sentences({ min: 1, max: 3 }),
      createdAt: isoDate(faker.date.recent({ days: 60 })),
      likes: faker.number.int({ min: 0, max: 500 }),
    }),
  },
]

export function findPreset(id: PresetId): Preset | undefined {
  return PRESETS.find((p) => p.id === id)
}

// ---------------------------------------------------------------------------
// Schema mode — user supplies a JSON template with `@token` strings that are
// replaced by generated values. Tokens can appear at any depth. Arrays of
// length 1 with a single token template produce a random-length array.
// ---------------------------------------------------------------------------

type Token = (args: string[]) => unknown

const TOKENS: Record<string, Token> = {
  // Identifiers
  id: () => faker.string.uuid(),
  uuid: () => faker.string.uuid(),
  // Numbers
  int: (a) => {
    const [min = '0', max = '1000'] = a
    return faker.number.int({ min: Number(min), max: Number(max) })
  },
  float: (a) => {
    const [min = '0', max = '100'] = a
    return Number(faker.number.float({ min: Number(min), max: Number(max), fractionDigits: 2 }))
  },
  bool: () => faker.datatype.boolean(),
  // People
  name: () => faker.person.fullName(),
  firstName: () => faker.person.firstName(),
  lastName: () => faker.person.lastName(),
  jobTitle: () => faker.person.jobTitle(),
  // Internet
  email: () => faker.internet.email(),
  username: () => faker.internet.username(),
  url: () => faker.internet.url(),
  ip: () => faker.internet.ip(),
  // Location
  address: () => faker.location.streetAddress(),
  city: () => faker.location.city(),
  country: () => faker.location.country(),
  state: () => faker.location.state(),
  zip: () => faker.location.zipCode(),
  // Text
  word: () => faker.lorem.word(),
  words: (a) => faker.lorem.words(Number(a[0] || 3)),
  sentence: () => faker.lorem.sentence(),
  paragraph: () => faker.lorem.paragraph(),
  // Dates
  date: () => faker.date.past().toISOString().slice(0, 10),
  datetime: () => faker.date.past().toISOString(),
  // Finance
  price: () => Number(faker.commerce.price()),
  currency: () => faker.finance.currencyCode(),
  // Phone
  phone: () => faker.phone.number(),
  // Color
  color: () => faker.color.rgb(),
  // Enum
  pick: (a) => faker.helpers.arrayElement(a.length > 0 ? a : ['']),
}

function resolveToken(raw: string): unknown {
  // `@token` or `@token(arg1,arg2)` or `@pick(a,b,c)`
  const match = raw.match(/^@([a-zA-Z]+)(?:\(([^)]*)\))?$/)
  if (!match) return raw
  const [, name, argsStr] = match
  const fn = TOKENS[name]
  if (!fn) return raw
  const args = argsStr ? argsStr.split(',').map((s) => s.trim()) : []
  try { return fn(args) } catch { return raw }
}

function resolveValue(value: unknown): unknown {
  if (typeof value === 'string') return resolveToken(value)
  if (Array.isArray(value)) {
    if (value.length === 1) {
      // Treat [template] as a random-length array of that template
      const len = faker.number.int({ min: 1, max: 5 })
      return Array.from({ length: len }, () => resolveValue(value[0]))
    }
    return value.map(resolveValue)
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
      out[k] = resolveValue(v)
    }
    return out
  }
  return value
}

export function generateFromSchema(schema: unknown): unknown {
  return resolveValue(schema)
}

export const AVAILABLE_TOKENS = Object.keys(TOKENS).sort()
