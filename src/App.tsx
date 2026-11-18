import { useEffect, useState, type ReactNode } from 'react'

import { CostByDayChart } from '@/charts/CostByDayChart'
import { LessonsChart } from '@/charts/LessonsChart'
import { ResponseTimeChart } from '@/charts/ResponseTimeChart'
import { RunsByDayChart } from '@/charts/RunsByDayChart'
import { StatCards } from '@/charts/StatCards'
import { StatTiles } from '@/charts/StatTiles'
import { activityStatCards, costStatCards, growthStatCards, healthStatCards } from '@/data'
import { AppShell } from '@/layout/AppShell'
import { NAV_ITEMS, type PageId } from '@/layout/nav'
import { AgentActivityPage } from '@/pages/AgentActivityPage'
import { ContentHealthPage } from '@/pages/ContentHealthPage'
import { CostPage } from '@/pages/CostPage'
import { GrowthPage } from '@/pages/GrowthPage'
import { HealthPage } from '@/pages/HealthPage'
import { AgentCostTable } from '@/tables/AgentCostTable'
import { AgentRunsTable } from '@/tables/AgentRunsTable'
import { AuditsTable } from '@/tables/AuditsTable'
import { DeploysTable } from '@/tables/DeploysTable'
import { GrowthTable } from '@/tables/GrowthTable'
import { LanguagesTable } from '@/tables/LanguagesTable'

// Assembled by the coordinator: each section comes from the agent that owns it.
const PAGES: Record<PageId, () => ReactNode> = {
  'content-health': () => (
    <ContentHealthPage
      stats={<StatCards />}
      languages={<LanguagesTable />}
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
      stats={<StatTiles tiles={healthStatCards} />}
      chart={<ResponseTimeChart />}
      table={<AuditsTable />}
    />
  ),
  'agent-activity': () => (
    <AgentActivityPage
      stats={<StatTiles tiles={activityStatCards} />}
      chart={<RunsByDayChart />}
      table={<AgentRunsTable />}
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
    const onHashChange = () => {
      setCurrent(pageFromHash())
      window.scrollTo(0, 0)
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return <AppShell current={current}>{PAGES[current]()}</AppShell>
}

export default App
