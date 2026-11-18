// Takes a full screenshot of every page at 1440 px and 390 px wide and saves them in screenshots/.
// Also fails if a page logs an error, scrolls sideways, or is missing its cards, table or chart.
//
//   node scripts/checks/screenshots.mjs            (the local dev server)
//   node scripts/checks/screenshots.mjs live       (the published site)
import { mkdirSync } from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

import { baseUrl, PAGE_IDS, ROOT } from './shared.mjs'

const base = baseUrl(process.argv[2])
const outDir = path.join(ROOT, 'screenshots')
const WIDTHS = [1440, 390]
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ channel: 'chrome' })
const problems = []

for (const width of WIDTHS) {
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: width < 600 ? 2 : 1,
  })
  const errors = []
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()))
  page.on('pageerror', (error) => errors.push(String(error)))

  for (const id of PAGE_IDS) {
    await page.goto(`${base}#/${id}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)

    // Only the content area scrolls, so grow the window to the content's full height to capture all of it.
    const fullHeight = await page.evaluate(() => {
      const main = document.querySelector('main')
      return window.innerHeight + (main ? main.scrollHeight - main.clientHeight : 0)
    })
    await page.setViewportSize({ width, height: Math.ceil(fullHeight) })
    await page.waitForTimeout(300)
    await page.screenshot({ path: path.join(outDir, `${id}-${width}.png`) })

    const seen = await page.evaluate(() => ({
      title: document.querySelector('h1')?.textContent ?? null,
      cards: document.querySelectorAll('[data-slot=card]').length,
      tableRows: document.querySelectorAll('table tbody tr').length,
      charts: document.querySelectorAll('.recharts-surface').length,
      sideways: document.documentElement.scrollWidth > window.innerWidth,
    }))
    await page.setViewportSize({ width, height: 900 })

    const label = `${id} at ${width} px`
    if (!seen.title) problems.push(`${label}: no page title`)
    if (!seen.cards) problems.push(`${label}: no cards`)
    if (!seen.tableRows) problems.push(`${label}: no table rows`)
    if (!seen.charts) problems.push(`${label}: no chart`)
    if (seen.sideways) problems.push(`${label}: the page scrolls sideways`)
    console.log(`${label}: ${seen.title}, ${seen.cards} cards, ${seen.tableRows} table rows, ${seen.charts} charts`)
  }

  for (const error of new Set(errors)) problems.push(`${width} px: console error: ${error}`)
  await page.close()
}

await browser.close()

console.log(`\nSaved ${PAGE_IDS.length * WIDTHS.length} screenshots to screenshots/`)
if (problems.length) {
  console.log(`\n${problems.length} problem(s):`)
  for (const problem of problems) console.log(`  - ${problem}`)
  process.exit(1)
}
console.log('No problems found.')
