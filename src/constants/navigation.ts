import {
  Home,
  KeyRound,
  QrCode,
  Clock,
  FileInput,
  CalendarDays,
  CaseSensitive,
  Braces,
  AlignLeft,
  FileText,
  GitCompare,
  Regex,
  Hash,
  Binary,
  Link2,
  ShieldCheck,
  Timer,
  Shuffle,
  Palette,
  Fingerprint,
  Type,
  Dices,
  Cake,
  Percent,
  Calculator,
  Activity,
  Scaling,
  Minimize2,
  Pipette,
  // New icons
  ArrowLeftRight,
  DollarSign,
  Milestone,
  Globe,
  ArrowDownUp,
  Replace,
  Database,
  Radio,
  ListTree,
  FileCode,
  MousePointer2,
  FileType,
  Network,
  Users,
  Paintbrush,
  Square,
  Star,
  Tags,
  Banknote,
  CalendarClock,
  TimerReset,
  SquareFunction,
  Sigma,
  Sparkle,
  Crop,
  RotateCw,
  ImageDown,
  Camera,
  ImagePlus,
  Coins,
  Dice5,
  CircleQuestionMark,
  Smile,
  ChartLineUp,
  HouseLine,
  Eye,
  Lock,
  CheckCircle,
  Scan,
  Scissors,
  Waveform,
  SwatchBook,
} from '../icons'
import type { LucideIcon } from '../icons'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  description: string
  /** Shared i18n key used for nav.<key>, navDescriptions.<key>, etc. */
  i18nKey: string
  /** Flag recently-added tools so the UI can show a "NEW" badge */
  isNew?: boolean
}

export type CategoryColor = 'blue' | 'amber' | 'emerald' | 'teal' | 'orange' | 'violet' | 'pink'

export interface NavCategory {
  label: string
  key: string
  color: CategoryColor
  items: NavItem[]
}

export const HOME_ITEM: NavItem = {
  label: 'Home',
  path: '/',
  icon: Home,
  description: 'All tools',
  i18nKey: 'home',
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'Converters',
    key: 'converters',
    color: 'blue',
    items: [
      { i18nKey: 'datetime',    label: 'Date & Time',        path: '/datetime',    icon: Clock,          description: 'Convert dates and timezones' },
      { i18nKey: 'unixTime',    label: 'Unix Timestamp',     path: '/unix-time',   icon: Clock,          description: 'Convert between Unix timestamps and dates', isNew: true },
      { i18nKey: 'hijri',       label: 'Hijri Converter',    path: '/hijri',       icon: CalendarDays,   description: 'Hijri ↔ Gregorian dates' },
      { i18nKey: 'worldClock',  label: 'World Clock',        path: '/world-clock', icon: Globe,          description: 'Multiple timezones at once' },
      { i18nKey: 'files',       label: 'File Converter',     path: '/files',       icon: FileInput,      description: 'Convert images and data files' },
      { i18nKey: 'units',       label: 'Unit Converter',     path: '/units',       icon: ArrowLeftRight, description: 'Length, weight, temperature, etc.' },
      { i18nKey: 'currency',    label: 'Currency Converter', path: '/currency',    icon: DollarSign,     description: 'Live currency exchange rates' },
      { i18nKey: 'roman',       label: 'Roman Numerals',     path: '/roman',       icon: Milestone,      description: 'Roman ↔ Arabic numerals' },
    ],
  },
  {
    label: 'Text Tools',
    key: 'textTools',
    color: 'amber',
    items: [
      { i18nKey: 'case',        label: 'Case Converter',   path: '/case',         icon: CaseSensitive, description: 'Convert text case styles' },
      { i18nKey: 'json',        label: 'JSON Formatter',   path: '/json',         icon: Braces,        description: 'Format and validate JSON' },
      { i18nKey: 'wordCount',   label: 'Word Counter',     path: '/word-count',   icon: AlignLeft,     description: 'Count words, chars, and more' },
      { i18nKey: 'markdown',    label: 'Markdown Preview', path: '/markdown',     icon: FileText,      description: 'Live markdown preview' },
      { i18nKey: 'diff',        label: 'Text Diff',        path: '/diff',         icon: GitCompare,    description: 'Compare two texts' },
      { i18nKey: 'regex',       label: 'Regex Tester',     path: '/regex',        icon: Regex,         description: 'Test regular expressions' },
      { i18nKey: 'sortLines',   label: 'Sort & Dedupe',    path: '/sort-lines',   icon: ArrowDownUp,   description: 'Sort and dedupe lines' },
      { i18nKey: 'findReplace', label: 'Find & Replace',   path: '/find-replace', icon: Replace,       description: 'Find and replace with regex' },
      { i18nKey: 'sql',         label: 'SQL Formatter',    path: '/sql',          icon: Database,      description: 'Prettify SQL queries' },
      { i18nKey: 'yaml',        label: 'YAML ↔ JSON',      path: '/yaml',         icon: Braces,        description: 'Convert between YAML and JSON' },
      { i18nKey: 'morse',       label: 'Morse Code',       path: '/morse',        icon: Radio,         description: 'Text ↔ Morse code' },
    ],
  },
  {
    label: 'Dev Tools',
    key: 'devTools',
    color: 'emerald',
    items: [
      { i18nKey: 'jsonTs',        label: 'JSON → Class',        path: '/json-ts',       icon: FileCode,      description: 'Generate classes for TS, C#, Java, Python, Go, Rust', isNew: true },
      { i18nKey: 'jsonSchema',    label: 'JSON Schema Validator', path: '/json-schema', icon: CheckCircle,   description: 'Validate JSON against a JSON Schema', isNew: true },
      { i18nKey: 'aes',           label: 'AES Encrypt/Decrypt', path: '/aes',           icon: Lock,          description: 'AES-256-GCM encryption via WebCrypto', isNew: true },
      { i18nKey: 'contrast',      label: 'Contrast Checker',    path: '/contrast',      icon: Eye,           description: 'WCAG AA/AAA contrast ratio checker', isNew: true },
      { i18nKey: 'qrScan',        label: 'QR Code Scanner',     path: '/qr-scan',       icon: QrCode,        description: 'Scan QR codes from images' },
      { i18nKey: 'jwt',           label: 'JWT Decoder',         path: '/jwt',           icon: ShieldCheck,   description: 'Decode JWT tokens' },
      { i18nKey: 'hash',          label: 'Hash Generator',      path: '/hash',          icon: Hash,          description: 'MD5, SHA-1, SHA-256, SHA-512' },
      { i18nKey: 'base64',        label: 'Base64',              path: '/base64',        icon: Binary,        description: 'Encode and decode Base64' },
      { i18nKey: 'urlEncode',     label: 'URL Encode/Decode',   path: '/url-encode',    icon: Link2,         description: 'Encode and decode URLs' },
      { i18nKey: 'htmlEntities',  label: 'HTML Entities',       path: '/html-entities', icon: FileCode,      description: 'Encode and decode HTML entities' },
      { i18nKey: 'cron',          label: 'CRON Parser',         path: '/cron',          icon: Timer,         description: 'Explain cron expressions' },
      { i18nKey: 'baseConvert',   label: 'Number Base',         path: '/base-convert',  icon: Shuffle,       description: 'Binary, hex, decimal, octal' },
      { i18nKey: 'color',         label: 'Color Converter',     path: '/color',         icon: Palette,       description: 'HEX ↔ RGB ↔ HSL ↔ CMYK' },
      { i18nKey: 'httpStatus',    label: 'HTTP Status Codes',   path: '/http-status',   icon: ListTree,      description: 'Lookup HTTP status codes' },
      { i18nKey: 'mime',          label: 'MIME Types',          path: '/mime',          icon: FileType,      description: 'File extension ↔ MIME type' },
      { i18nKey: 'userAgent',     label: 'User Agent Parser',   path: '/user-agent',    icon: MousePointer2, description: 'Decode user agent strings' },
      { i18nKey: 'subnet',        label: 'Subnet Calculator',   path: '/subnet',        icon: Network,       description: 'IPv4 CIDR math' },
    ],
  },
  {
    label: 'Generators',
    key: 'generators',
    color: 'teal',
    items: [
      { i18nKey: 'password',   label: 'Password Generator', path: '/password',   icon: KeyRound,    description: 'Generate secure passwords' },
      { i18nKey: 'qr',         label: 'QR Code',            path: '/qr',         icon: QrCode,      description: 'Create QR codes' },
      { i18nKey: 'uuid',       label: 'UUID Generator',     path: '/uuid',       icon: Fingerprint, description: 'Generate UUIDs v4' },
      { i18nKey: 'fakeData',   label: 'Fake Data',          path: '/fake-data',  icon: Users,       description: 'Names, emails, phones, etc.' },
      { i18nKey: 'fakeJson',   label: 'Fake JSON',          path: '/fake-json',  icon: Sparkle,     description: 'Generate random JSON objects from presets or a schema', isNew: true },
      { i18nKey: 'palette',    label: 'Color Palette',      path: '/palette',    icon: SwatchBook,  description: 'Harmonies, shades, and CSS variables', isNew: true },
      { i18nKey: 'lorem',      label: 'Lorem Ipsum',        path: '/lorem',      icon: Type,        description: 'Generate placeholder text' },
      { i18nKey: 'random',     label: 'Random Number',      path: '/random',     icon: Dices,       description: 'Generate random numbers' },
      { i18nKey: 'gradient',   label: 'CSS Gradient',       path: '/gradient',   icon: Paintbrush,  description: 'Linear and radial gradients' },
      { i18nKey: 'boxShadow',  label: 'Box Shadow',         path: '/box-shadow', icon: Square,      description: 'Visual CSS shadow builder' },
      { i18nKey: 'favicon',    label: 'Favicon',            path: '/favicon',    icon: Star,        description: 'Create favicons' },
      { i18nKey: 'metaTags',   label: 'Meta Tags',          path: '/meta-tags',  icon: Tags,        description: 'OG + Twitter card tags' },
    ],
  },
  {
    label: 'Calculators',
    key: 'calculators',
    color: 'orange',
    items: [
      { i18nKey: 'compound',   label: 'Compound Interest',     path: '/compound',   icon: ChartLineUp,    description: 'Grow savings with contributions and compounding', isNew: true },
      { i18nKey: 'mortgage',   label: 'Mortgage Amortization', path: '/mortgage',   icon: HouseLine,      description: 'Monthly payment, amortization schedule, extra payments', isNew: true },
      { i18nKey: 'loan',       label: 'Loan Calculator',       path: '/loan',       icon: Calculator,     description: 'Monthly payment & total interest' },
      { i18nKey: 'age',        label: 'Age Calculator',        path: '/age',        icon: Cake,           description: 'Calculate age from birthdate' },
      { i18nKey: 'percentage', label: 'Percentage',            path: '/percentage', icon: Percent,        description: 'Percentage calculations' },
      { i18nKey: 'bmi',        label: 'BMI Calculator',        path: '/bmi',        icon: Activity,       description: 'Body mass index' },
      { i18nKey: 'tip',        label: 'Tip Calculator',        path: '/tip',        icon: Banknote,       description: 'Bill tip and split' },
      { i18nKey: 'dateDiff',   label: 'Date Difference',       path: '/date-diff',  icon: CalendarClock,  description: 'Days between two dates' },
      { i18nKey: 'duration',   label: 'Time Duration',         path: '/duration',   icon: TimerReset,     description: 'Add or subtract time' },
      { i18nKey: 'scientific', label: 'Scientific Calculator', path: '/scientific', icon: SquareFunction, description: 'Full-featured calculator' },
      { i18nKey: 'prime',      label: 'Prime Checker',         path: '/prime',      icon: Sigma,          description: 'Is it prime? Factorize' },
    ],
  },
  {
    label: 'Media',
    key: 'imageTools',
    color: 'violet',
    items: [
      { i18nKey: 'bgRemove',    label: 'Background Remover', path: '/bg-remove',   icon: Scissors,   description: 'Remove image background with on-device AI', isNew: true },
      { i18nKey: 'ocr',         label: 'OCR (Text from Image)', path: '/ocr',      icon: Scan,       description: 'Extract text from images via Tesseract', isNew: true },
      { i18nKey: 'audio',       label: 'Audio Inspector',    path: '/audio',       icon: Waveform,   description: 'Waveform + metadata for any audio file', isNew: true },
      { i18nKey: 'resize',      label: 'Image Resizer',      path: '/resize',      icon: Scaling,    description: 'Resize images by px or %' },
      { i18nKey: 'compress',    label: 'Image Compressor',   path: '/compress',    icon: Minimize2,  description: 'Reduce image file size' },
      { i18nKey: 'colorPick',   label: 'Color Picker',       path: '/color-pick',  icon: Pipette,    description: 'Pick colors from an image' },
      { i18nKey: 'crop',        label: 'Image Cropper',      path: '/crop',        icon: Crop,       description: 'Crop with aspect ratios' },
      { i18nKey: 'rotate',      label: 'Rotate / Flip',      path: '/rotate',      icon: RotateCw,   description: 'Rotate and flip images' },
      { i18nKey: 'svgPng',      label: 'SVG → PNG',          path: '/svg-png',     icon: ImageDown,  description: 'Rasterize SVG to PNG' },
      { i18nKey: 'exif',        label: 'EXIF Viewer',        path: '/exif',        icon: Camera,     description: 'Read image metadata' },
      { i18nKey: 'placeholder', label: 'Placeholder Image',  path: '/placeholder', icon: ImagePlus,  description: 'Generate placeholder images' },
    ],
  },
  {
    label: 'Fun',
    key: 'fun',
    color: 'pink',
    items: [
      { i18nKey: 'coinFlip',  label: 'Coin Flip',       path: '/coin-flip', icon: Coins,              description: 'Flip a virtual coin' },
      { i18nKey: 'dice',      label: 'Dice Roller',     path: '/dice',      icon: Dice5,              description: 'Roll dice of any size' },
      { i18nKey: 'decide',    label: 'Decision Maker',  path: '/decide',    icon: CircleQuestionMark, description: 'Yes/no or pick one' },
      { i18nKey: 'emoji',     label: 'Emoji Finder',    path: '/emoji',     icon: Smile,              description: 'Search and copy emojis' },
    ],
  },
]

// Flat list of all items for Home grid
export const ALL_NAV_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap((c) => c.items)
