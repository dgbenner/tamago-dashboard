// Opens every page of the published site the way a bookmark would, then refreshes it, and checks that
// the right page loads with its warning banner, "Sample data" badge, cards, table, chart and noindex tag.
//
//   node scripts/checks/live-check.mjs             (the published site)
//   node scripts/checks/live-check.mjs local       (the local dev server)
import { chromium } from 'playwright'

import { baseUrl, LIVE_URL, PAGE_IDS } from './shared.mjs'

const base = baseUrl(process.argv[2], LIVE_URL)
const BANNER = 'Placeholder numbers. Nothing on this page is real data yet.'

const browser = await chromium.launch({ channel: 'chrome' })
let failed = 0

function inspect(page) {
  return page.evaluate(() => {
    const banner = document.querySelector('[role=note]')
    const box = banner?.getBoundingClientRect()
    return {
      title: document.querySelector('h1')?.textContent ?? null,
      current: document.querySelector('nav [aria-current=page]')?.getAttribute('href') ?? null,
      banner: banner?.innerText.trim() ?? null,
      bannerAtTop: !!box && box.top === 0 && Math.round(box.width) === window.innerWidth,
      badge: document.querySelector('header [data-slot=badge]')?.textContent ?? null,
      cards: document.querySelectorAll('[data-slot=card]').length,
      tableRows: document.querySelectorAll('table tbody tr').length,
      charts: document.querySelectorAll('.recharts-surface').length,
      robots: document.querySelector('meta[name=robots]')?.getAttribute('content') ?? null,
    }
  })
}

for (const id of PAGE_IDS) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  const problems = []
  page.on('pageerror', (error) => problems.push(`page error: ${error}`))
  page.on('response', (response) => response.status() >= 400 && problems.push(`${response.status()} ${response.url()}`))

  const response = await page.goto(`${base}#/${id}`, { waitUntil: 'networkidle' })
  if (response.status() !== 200) problems.push(`status ${response.status()}`)
  const first = await inspect(page)

  // Scroll the content to the bottom: the banner must still be at the top.
  await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 1e6))
  const scrolled = await inspect(page)

  await page.reload({ waitUntil: 'networkidle' })
  const reloaded = await inspect(page)

  if (first.current !== `#/${id}`) problems.push(`opened ${first.current}, not #/${id}`)
  if (first.banner !== BANNER) problems.push('warning banner missing or its text changed')
  if (!scrolled.bannerAtTop) problems.push('warning banner is not at the top after scrolling')
  if (first.badge !== 'Sample data') problems.push('"Sample data" badge missing')
  if (!first.cards) problems.push('no cards')
  if (!first.tableRows) problems.push('no table rows')
  if (!first.charts) problems.push('no chart')
  if (!first.robots?.includes('noindex')) problems.push('noindex tag missing')
  if (JSON.stringify(first) !== JSON.stringify(reloaded)) problems.push('the page changed after a refresh')

  console.log(`${problems.length ? 'NOT DONE' : 'DONE    '}  ${first.title ?? id}  ${base}#/${id}`)
  for (const problem of problems) console.log(`            - ${problem}`)
  failed += problems.length ? 1 : 0
  await page.close()
}

await browser.close()
process.exit(failed ? 1 : 0)
