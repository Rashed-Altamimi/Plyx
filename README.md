# Plex

A collection of **62 utility tools** that run entirely in your browser. No data ever leaves your device.

Built with React 19 + Vite + TypeScript + Tailwind CSS v4 + DaisyUI.

---

## Features

- **62 tools** across 7 categories — converters, text tools, dev tools, generators, calculators, image tools, and fun
- **⌘K command palette** — fuzzy-search any tool from anywhere
- **Favorites** — star tools to pin them at the top of the sidebar and home page
- **Recently used** — automatic tracking of your last 5 visited tools
- **10 themes** powered by DaisyUI (light, dark, cupcake, corporate, emerald, synthwave, dracula, nord, sunset, retro)
- **Bilingual** — English + Arabic with full RTL layout support
- **100% client-side** — no backend, no tracking, no API calls (except Currency Converter, which clearly discloses it)
- **Lazy-loaded routes** — heavy tools (Faker, SQL Formatter, EXIF) only load when you visit them
- **Persistent state** — themes, language, favorites, and recents survive reloads

---

## Tools

### Converters (9)
Password Generator · QR Code · Date & Time · File Converter · Hijri ↔ Gregorian · Unit Converter · Currency Converter · Roman Numerals · World Clock

### Text Tools (11)
Case Converter · JSON Formatter · Word Counter · Markdown Preview · Text Diff · Regex Tester · Sort & Dedupe Lines · Find & Replace · SQL Formatter · YAML ↔ JSON · Morse Code

### Dev Tools (13)
Hash Generator · Base64 · URL Encode/Decode · JWT Decoder · CRON Parser · Number Base · Color Converter · HTTP Status Codes · MIME Types · User Agent Parser · HTML Entities · Subnet Calculator · JSON → TypeScript

### Generators (8)
UUID · Lorem Ipsum · Random Number · Fake Data · CSS Gradient · Box Shadow · Favicon · Meta Tags

### Calculators (9)
Age · Percentage · Loan · BMI · Tip · Date Difference · Time Duration · Scientific · Prime Checker

### Image Tools (8)
Image Resizer · Image Compressor · Color Picker · Image Cropper · Rotate / Flip · SVG → PNG · EXIF Viewer · Placeholder Image

### Fun (4)
Coin Flip · Dice Roller · Decision Maker · Emoji Finder

---

## Tech Stack

| | |
|---|---|
| **Framework** | React 19 + Vite 6 |
| **Language** | TypeScript 6 |
| **Styling** | Tailwind CSS v4 + DaisyUI v5 |
| **Routing** | React Router v7 |
| **i18n** | i18next + react-i18next |
| **Icons** | lucide-react |
| **Build** | Vite (lazy chunks per route) |

### Key libraries

`qrcode` · `hijri-converter` · `date-fns` · `papaparse` · `react-markdown` · `diff` · `cronstrue` · `spark-md5` · `convert-units` · `sql-formatter` · `js-yaml` · `ua-parser-js` · `json-to-ts` · `@faker-js/faker` · `exifr`

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm

### Install

```bash
npm install
```

### Develop

```bash
npm run dev
```

Opens at `http://localhost:5173`.

### Build

```bash
npm run build
```

Output goes to `dist/`. The main bundle is ~120 KB gzipped, with each tool lazy-loaded on demand.

### Preview production build

```bash
npm run preview
```

---

## Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Open command palette |
| `↑` / `↓` | Navigate palette results |
| `↵` | Open selected tool |
| `Esc` | Close palette |

---

## Project Structure

```
src/
├── main.tsx                  # Entry point + i18n init
├── App.tsx                   # Router + lazy routes
├── index.css                 # Tailwind + DaisyUI + RTL helpers
├── i18n/                     # en.ts, ar.ts, config
├── constants/navigation.ts   # Tool registry
├── hooks/                    # useTheme, useFavorites, useRecents,
│                             #   useCommandPalette, useDirection, etc.
├── utils/                    # Pure logic (roman, prime, subnet, mathEval, …)
├── data/                     # Static datasets (httpStatus, mimeTypes, emojis, …)
├── components/
│   ├── layout/               # AppShell, Sidebar, MobileHeader,
│   │                         #   CommandPalette, ThemeSwitcher, RouteTracker
│   └── ui/                   # Button, Card, Input, Select, Tabs, etc.
└── pages/                    # 62 tool pages, each in its own folder
```

---

## Privacy

Plex is designed to run **entirely in your browser**. There is no analytics, no telemetry, no backend. The only tool that makes a network request is the **Currency Converter**, which fetches public exchange rates from a free API and clearly discloses this on the page.

All your data — input text, files, favorites, theme, language preference — stays on your device.

---

## License

MIT
