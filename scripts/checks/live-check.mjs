// Opens every page of the published site the way a bookmark would, then refreshes it, and checks that
// the right page loads with the right banner, its cards, table, chart and noindex tag.
//   - A real page: the quiet line "Real data, snapshot from <date and time>", and no "Sample data" badge.
//   - A placeholder page: the red warning banner and the "Sample data" badge.
// It also checks that no page asks the network for anything beyond its own files.
//
//   node scripts/checks/live-check.mjs             (the published site)
//   node scripts/checks/live-check.mjs local       (the local dev server)
import { chromium } from 'playwright'

import { baseUrl, LIVE_URL, PAGE_IDS, PAGES_WITHOUT_CHART, REAL_PAGES } from './shared.mjs'

const base = baseUrl(process.argv[2], LIVE_URL)
const PLACEHOLDER_BANNER = 'Placeholder numbers. Nothing on this page is real data yet.'
const REAL_BANNER = /^Real data, snapshot from \w{3} \d{1,2}, \d{4}, \d{1,2}:\d{2} [AP]M$/

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
      bannerKind: banner?.getAttribute('data-banner') ?? null,
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
  // The pages make no network calls: every request must be for the site's own files.
  page.on('request', (request) => {
    const url = request.url()
    if (!url.startsWith(base) && !url.startsWith('data:')) problems.push(`asked the network for ${url}`)
  })

  const response = await page.goto(`${base}#/${id}`, { waitUntil: 'networkidle' })
  if (response.status() !== 200) problems.push(`status ${response.status()}`)
  const first = await inspect(page)

  // Scroll the content to the bottom: the banner must still be at the top.
  await page.evaluate(() => document.querySelector('main')?.scrollTo(0, 1e6))
  const scrolled = await inspect(page)

  await page.reload({ waitUntil: 'networkidle' })
  const reloaded = await inspect(page)

  if (first.current !== `#/${id}`) problems.push(`opened ${first.current}, not #/${id}`)
  const real = REAL_PAGES.includes(id)
  if (real) {
    if (first.bannerKind !== 'real' || !REAL_BANNER.test(first.banner ?? '')) problems.push(`the "Real data, snapshot from …" line is missing or wrong: ${first.banner}`)
    if (first.badge) problems.push('a real page still shows the "Sample data" badge')
  } else {
    if (first.bannerKind !== 'placeholder' || first.banner !== PLACEHOLDER_BANNER) problems.push('placeholder warning banner missing or its text changed')
    if (first.badge !== 'Sample data') problems.push('"Sample data" badge missing')
  }
  if (!scrolled.bannerAtTop) problems.push('the banner is not at the top after scrolling')
  if (!first.cards) problems.push('no cards')
  if (!first.tableRows) problems.push('no table rows')
  if (!first.charts && !PAGES_WITHOUT_CHART.includes(id)) problems.push('no chart')
  if (!first.robots?.includes('noindex')) problems.push('noindex tag missing')
  if (JSON.stringify(first) !== JSON.stringify(reloaded)) problems.push('the page changed after a refresh')

  console.log(`${problems.length ? 'NOT DONE' : 'DONE    '}  ${(first.title ?? id).padEnd(15)} ${real ? 'real       ' : 'placeholder'}  ${base}#/${id}`)
  for (const problem of problems) console.log(`            - ${problem}`)
  failed += problems.length ? 1 : 0
  await page.close()
}

await browser.close()
process.exit(failed ? 1 : 0)
