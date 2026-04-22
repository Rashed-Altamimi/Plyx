// Regenerate public/sitemap.xml from the navigation catalog.
// Runs as a `prebuild` script so sitemap.xml is always in sync with routes.

import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const navPath = resolve(__dirname, '..', 'src', 'constants', 'navigation.ts')
const outPath = resolve(__dirname, '..', 'public', 'sitemap.xml')

const SITE_URL = 'https://rashed-altamimi.github.io/Plyx'

// Parse the `path: '/foo'` literals from the TS source. No TS toolchain
// required — we only need the route strings and this keeps prebuild fast.
const source = readFileSync(navPath, 'utf8')
const paths = new Set(['/'])
const rx = /path:\s*'([^']+)'/g
let match
while ((match = rx.exec(source)) !== null) {
  const p = match[1]
  if (p.startsWith('/')) paths.add(p)
}

const today = new Date().toISOString().slice(0, 10)
const urls = Array.from(paths).sort()

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map((p) => {
    const loc = p === '/' ? `${SITE_URL}/` : `${SITE_URL}${p}`
    const priority = p === '/' ? '1.0' : '0.7'
    return [
      '  <url>',
      `    <loc>${loc}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>monthly</changefreq>`,
      `    <priority>${priority}</priority>`,
      '  </url>',
    ].join('\n')
  }),
  '</urlset>',
  '',
].join('\n')

writeFileSync(outPath, xml, 'utf8')
console.log(`sitemap.xml: ${urls.length} URLs written to ${outPath}`)
