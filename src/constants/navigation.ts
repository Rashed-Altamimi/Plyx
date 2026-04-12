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
  Crop,
  RotateCw,
  ImageDown,
  Camera,
  ImagePlus,
  Coins,
  Dice5,
  CircleQuestionMark,
  Smile,
} from '../icons'
import type { LucideIcon } from '../icons'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  description: string
}

export interface NavCategory {
  label: string
  items: NavItem[]
}

export const HOME_ITEM: NavItem = {
  label: 'Home',
  path: '/',
  icon: Home,
  description: 'All tools',
}

export const NAV_CATEGORIES: NavCategory[] = [
  {
    label: 'Converters',
    items: [
      { label: 'Password Generator', path: '/password',    icon: KeyRound,       description: 'Generate secure passwords' },
      { label: 'QR Code',            path: '/qr',          icon: QrCode,         description: 'Create QR codes' },
      { label: 'Date & Time',        path: '/datetime',    icon: Clock,          description: 'Convert dates and timezones' },
      { label: 'File Converter',     path: '/files',       icon: FileInput,      description: 'Convert images and data files' },
      { label: 'Hijri Converter',    path: '/hijri',       icon: CalendarDays,   description: 'Hijri ↔ Gregorian dates' },
      { label: 'Unit Converter',     path: '/units',       icon: ArrowLeftRight, description: 'Length, weight, temperature, etc.' },
      { label: 'Currency Converter', path: '/currency',    icon: DollarSign,     description: 'Live currency exchange rates' },
      { label: 'Roman Numerals',     path: '/roman',       icon: Milestone,      description: 'Roman ↔ Arabic numerals' },
      { label: 'World Clock',        path: '/world-clock', icon: Globe,          description: 'Multiple timezones at once' },
    ],
  },
  {
    label: 'Text Tools',
    items: [
      { label: 'Case Converter',   path: '/case',         icon: CaseSensitive, description: 'Convert text case styles' },
      { label: 'JSON Formatter',   path: '/json',         icon: Braces,        description: 'Format and validate JSON' },
      { label: 'Word Counter',     path: '/word-count',   icon: AlignLeft,     description: 'Count words, chars, and more' },
      { label: 'Markdown Preview', path: '/markdown',     icon: FileText,      description: 'Live markdown preview' },
      { label: 'Text Diff',        path: '/diff',         icon: GitCompare,    description: 'Compare two texts' },
      { label: 'Regex Tester',     path: '/regex',        icon: Regex,         description: 'Test regular expressions' },
      { label: 'Sort & Dedupe',    path: '/sort-lines',   icon: ArrowDownUp,   description: 'Sort and dedupe lines' },
      { label: 'Find & Replace',   path: '/find-replace', icon: Replace,       description: 'Find and replace with regex' },
      { label: 'SQL Formatter',    path: '/sql',          icon: Database,      description: 'Prettify SQL queries' },
      { label: 'YAML ↔ JSON',      path: '/yaml',         icon: Braces,        description: 'Convert between YAML and JSON' },
      { label: 'Morse Code',       path: '/morse',        icon: Radio,         description: 'Text ↔ Morse code' },
    ],
  },
  {
    label: 'Dev Tools',
    items: [
      { label: 'Hash Generator',    path: '/hash',          icon: Hash,          description: 'MD5, SHA-1, SHA-256, SHA-512' },
      { label: 'Base64',            path: '/base64',        icon: Binary,        description: 'Encode and decode Base64' },
      { label: 'URL Encode/Decode', path: '/url-encode',    icon: Link2,         description: 'Encode and decode URLs' },
      { label: 'JWT Decoder',       path: '/jwt',           icon: ShieldCheck,   description: 'Decode JWT tokens' },
      { label: 'CRON Parser',       path: '/cron',          icon: Timer,         description: 'Explain cron expressions' },
      { label: 'Number Base',       path: '/base-convert',  icon: Shuffle,       description: 'Binary, hex, decimal, octal' },
      { label: 'Color Converter',   path: '/color',         icon: Palette,       description: 'HEX ↔ RGB ↔ HSL ↔ CMYK' },
      { label: 'HTTP Status Codes', path: '/http-status',   icon: ListTree,      description: 'Lookup HTTP status codes' },
      { label: 'MIME Types',        path: '/mime',          icon: FileType,      description: 'File extension ↔ MIME type' },
      { label: 'User Agent Parser', path: '/user-agent',    icon: MousePointer2, description: 'Decode user agent strings' },
      { label: 'HTML Entities',     path: '/html-entities', icon: FileCode,      description: 'Encode and decode HTML entities' },
      { label: 'Subnet Calculator', path: '/subnet',        icon: Network,       description: 'IPv4 CIDR math' },
      { label: 'JSON → TypeScript', path: '/json-ts',       icon: FileCode,      description: 'Generate TS interfaces from JSON' },
    ],
  },
  {
    label: 'Generators',
    items: [
      { label: 'UUID Generator',   path: '/uuid',       icon: Fingerprint, description: 'Generate UUIDs v4' },
      { label: 'Lorem Ipsum',      path: '/lorem',      icon: Type,        description: 'Generate placeholder text' },
      { label: 'Random Number',    path: '/random',     icon: Dices,       description: 'Generate random numbers' },
      { label: 'Fake Data',        path: '/fake-data',  icon: Users,       description: 'Names, emails, phones, etc.' },
      { label: 'CSS Gradient',     path: '/gradient',   icon: Paintbrush,  description: 'Linear and radial gradients' },
      { label: 'Box Shadow',       path: '/box-shadow', icon: Square,      description: 'Visual CSS shadow builder' },
      { label: 'Favicon',          path: '/favicon',    icon: Star,        description: 'Create favicons' },
      { label: 'Meta Tags',        path: '/meta-tags',  icon: Tags,        description: 'OG + Twitter card tags' },
    ],
  },
  {
    label: 'Calculators',
    items: [
      { label: 'Age Calculator',       path: '/age',        icon: Cake,           description: 'Calculate age from birthdate' },
      { label: 'Percentage',           path: '/percentage', icon: Percent,        description: 'Percentage calculations' },
      { label: 'Loan Calculator',      path: '/loan',       icon: Calculator,     description: 'Monthly payment & total interest' },
      { label: 'BMI Calculator',       path: '/bmi',        icon: Activity,       description: 'Body mass index' },
      { label: 'Tip Calculator',       path: '/tip',        icon: Banknote,       description: 'Bill tip and split' },
      { label: 'Date Difference',      path: '/date-diff',  icon: CalendarClock,  description: 'Days between two dates' },
      { label: 'Time Duration',        path: '/duration',   icon: TimerReset,     description: 'Add or subtract time' },
      { label: 'Scientific Calculator', path: '/scientific', icon: SquareFunction, description: 'Full-featured calculator' },
      { label: 'Prime Checker',        path: '/prime',      icon: Sigma,          description: 'Is it prime? Factorize' },
    ],
  },
  {
    label: 'Image Tools',
    items: [
      { label: 'Image Resizer',    path: '/resize',      icon: Scaling,    description: 'Resize images by px or %' },
      { label: 'Image Compressor', path: '/compress',    icon: Minimize2,  description: 'Reduce image file size' },
      { label: 'Color Picker',     path: '/color-pick',  icon: Pipette,    description: 'Pick colors from an image' },
      { label: 'Image Cropper',    path: '/crop',        icon: Crop,       description: 'Crop with aspect ratios' },
      { label: 'Rotate / Flip',    path: '/rotate',      icon: RotateCw,   description: 'Rotate and flip images' },
      { label: 'SVG → PNG',        path: '/svg-png',     icon: ImageDown,  description: 'Rasterize SVG to PNG' },
      { label: 'EXIF Viewer',      path: '/exif',        icon: Camera,     description: 'Read image metadata' },
      { label: 'Placeholder Image', path: '/placeholder', icon: ImagePlus, description: 'Generate placeholder images' },
    ],
  },
  {
    label: 'Fun',
    items: [
      { label: 'Coin Flip',       path: '/coin-flip', icon: Coins,              description: 'Flip a virtual coin' },
      { label: 'Dice Roller',     path: '/dice',      icon: Dice5,              description: 'Roll dice of any size' },
      { label: 'Decision Maker',  path: '/decide',    icon: CircleQuestionMark, description: 'Yes/no or pick one' },
      { label: 'Emoji Finder',    path: '/emoji',     icon: Smile,              description: 'Search and copy emojis' },
    ],
  },
]

// Flat list of all items for Home grid
export const ALL_NAV_ITEMS: NavItem[] = NAV_CATEGORIES.flatMap((c) => c.items)
