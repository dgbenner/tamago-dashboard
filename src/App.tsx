import { useEffect, useState, type ReactNode } from 'react'

import { ActivityByDayChart } from '@/charts/ActivityByDayChart'
import { CostByDayChart } from '@/charts/CostByDayChart'
import { LessonsChart } from '@/charts/LessonsChart'
import { ResponseTimeChart } from '@/charts/ResponseTimeChart'
import { StatTiles } from '@/charts/StatTiles'
import { activityStatTiles, contentStatTiles, costStatCards, growthStatCards, healthStatTiles } from '@/data'
import { AppShell } from '@/layout/AppShell'
import { NAV_ITEMS, type PageId } from '@/layout/nav'
import { AgentActivityPage } from '@/pages/AgentActivityPage'
import { ContentHealthPage } from '@/pages/ContentHealthPage'
import { CostPage } from '@/pages/CostPage'
import { GrowthPage } from '@/pages/GrowthPage'
import { HealthPage } from '@/pages/HealthPage'
import { AgentCostTable } from '@/tables/AgentCostTable'
import { DeploysTable } from '@/tables/DeploysTable'
import { GrowthTable } from '@/tables/GrowthTable'
import { HealthChecksTable } from '@/tables/HealthChecksTable'
import { LanguagesTable } from '@/tables/LanguagesTable'
import { ReviewsAppliedTable } from '@/tables/ReviewsAppliedTable'
import { SentencesTable } from '@/tables/SentencesTable'

// Assembled by the coordinator: each section comes from the agent that owns it.
// Content health, Health and Agent activity read the real snapshot (npm run snapshot); Growth and Cost are placeholders.
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
      chart={<CostByDayChart />}
      table={<AgentCostTable />}
    />
  ),
}

/** The page named in the address (`#/growth`). Anything unknown falls back to the first page. */
function pageFromHash(): PageId {
  const id = window.location.hash.replace(/^#\/?/, '')
  return NAV_ITEMS.find((item) => item.id === id)?.id ?? NAV_ITEMS[0].id
}

function App() {
  const [current, setCurrent] = useState<PageId>(pageFromHash)

  useEffect(() => {
    const onHashChange = () => setCurrent(pageFromHash())
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return <AppShell current={current}>{PAGES[current]()}</AppShell>
}

export default App
