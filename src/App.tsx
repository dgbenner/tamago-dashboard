import { useEffect, useState, type ReactNode } from 'react'

import { ActivityByDayChart } from '@/charts/ActivityByDayChart'
import { DistanceChart } from '@/charts/DistanceChart'
import { LessonsChart } from '@/charts/LessonsChart'
import { ResponseTimeChart } from '@/charts/ResponseTimeChart'
import { StatTiles } from '@/charts/StatTiles'
import { TokensByDayChart } from '@/charts/TokensByDayChart'
import { activityStatTiles, contentStatTiles, costStatCards, growthStatCards, healthStatTiles } from '@/data'
import { AppShell } from '@/layout/AppShell'
import { NAV_ITEMS, type PageId } from '@/layout/nav'
import { AgentActivityPage } from '@/pages/AgentActivityPage'
import { CefrPage } from '@/pages/CefrPage'
import { ContentHealthPage } from '@/pages/ContentHealthPage'
import { CostPage } from '@/pages/CostPage'
import { GrowthPage } from '@/pages/GrowthPage'
import { HealthPage } from '@/pages/HealthPage'
import { DeploysTable } from '@/tables/DeploysTable'
import { ExamsTable } from '@/tables/ExamsTable'
import { GrowthTable } from '@/tables/GrowthTable'
import { HealthChecksTable } from '@/tables/HealthChecksTable'
import { LanguagesTable } from '@/tables/LanguagesTable'
import { ReviewsAppliedTable } from '@/tables/ReviewsAppliedTable'
import { SentencesTable } from '@/tables/SentencesTable'
import { TokensByModelTable } from '@/tables/TokensByModelTable'

// Assembled by the coordinator: each section comes from the agent that owns it.
// Content Health, Content Growth, System Health and Agent Activity read the real snapshot (npm run snapshot); Cost is a placeholder.
const PAGES: Record<PageId, () => ReactNode> = {
  'content-health': () => (
    <ContentHealthPage
      stats={<StatTiles tiles={contentStatTiles} />}
      languages={<LanguagesTable />}
      sentences={<SentencesTable />}
      deploys={<DeploysTable />}
    />
  ),
  growth: () => (
    <GrowthPage
      stats={<StatTiles tiles={growthStatCards} />}
      chart={<LessonsChart />}
      table={<GrowthTable />}
    />
  ),
  health: () => (
    <HealthPage
      stats={<StatTiles tiles={healthStatTiles} />}
      chart={<ResponseTimeChart />}
      table={<HealthChecksTable />}
    />
  ),
  'agent-activity': () => (
    <AgentActivityPage
      stats={<StatTiles tiles={activityStatTiles} />}
      chart={<ActivityByDayChart />}
      table={<ReviewsAppliedTable />}
    />
  ),
  cost: () => (
    <CostPage
      stats={<StatTiles tiles={costStatCards} />}
      chart={<TokensByDayChart />}
      table={<TokensByModelTable />}
    />
  ),
  cefr: () => <CefrPage distance={<DistanceChart />} exams={<ExamsTable />} />,
}

/**
 * The page named in the address (`#/growth`), and the element to scroll to when the address names one
 * (`#/content-health/language-fr`). An unknown page falls back to the first page.
 */
function routeFromHash(): { page: PageId; target: string | null } {
  const [id = '', target = ''] = window.location.hash.replace(/^#\/?/, '').split('/')
  return { page: NAV_ITEMS.find((item) => item.id === id)?.id ?? NAV_ITEMS[0].id, target: target || null }
}

/** How long a jumped-to element stays highlighted, in milliseconds. */
const TARGET_HIGHLIGHT_MS = 2000

function App() {
  const [route, setRoute] = useState(routeFromHash)
  const current = route.page

  useEffect(() => {
    const onHashChange = () => setRoute(routeFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // After the page has drawn (and the shell has scrolled to the top), bring the named element into view and mark it.
  useEffect(() => {
    if (!route.target) return
    const frame = requestAnimationFrame(() => {
      const element = document.getElementById(route.target ?? '')
      if (!element) return
      element.scrollIntoView({ block: 'center', behavior: 'smooth' })
      element.classList.add('jump-target')
      window.setTimeout(() => element.classList.remove('jump-target'), TARGET_HIGHLIGHT_MS)
    })
    return () => cancelAnimationFrame(frame)
  }, [route])

  return <AppShell current={current}>{PAGES[current]()}</AppShell>
}

export default App
