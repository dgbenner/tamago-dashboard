// Cost page: cost per day, the per-agent table rows for this month and the four stat cards.

import { agentDaily, agents, averageCostPerRun, sumAgentDays } from './agents'
import { formatCurrency, formatTokens } from './format'
import { daysBetween } from './internal'
import { inPeriod, periods } from './periods'
import { buildTiles } from './tiles'
import type { AgentCostRow, AgentTotals, CostByDayPoint, StatTile } from './types'

/** Bar chart data: one `{ date, cost }` per day for the last 30 days, oldest first. All agents together. */
export const costByDay: CostByDayPoint[] = daysBetween(periods.last30Days.start, periods.last30Days.end).map((date) => ({
  date,
  cost: sumAgentDays(agentDaily.filter((day) => day.date === date)).cost,
}))

/** Table rows, one per agent in display order, for this month: runs, tokens, cost, average cost per run. */
export const agentCostRows: AgentCostRow[] = agents.map((agent) => {
  const totals = sumAgentDays(inPeriod(agentDaily, periods.thisMonth).filter((day) => day.agentId === agent.id))
  return { id: agent.id, name: agent.name, ...totals, averageCostPerRun: averageCostPerRun(totals) }
})

/** This month's runs, tokens and cost for all agents together. Equals the sums of `agentCostRows`. */
export function costTotalsThisMonth(): AgentTotals {
  return sumAgentDays(inPeriod(agentDaily, periods.thisMonth))
}

/** The row of `agentCostRows` with the highest cost this month. */
export function highestCostAgent(rows: AgentCostRow[] = agentCostRows): AgentCostRow {
  return rows.reduce((highest, row) => (row.cost > highest.cost ? row : highest))
}

/**
 * The Cost page's four stat cards, in page order: Cost this month, Average cost per run,
 * Tokens this month, Highest-cost agent (the agent's name).
 */
export const costStatCards: StatTile[] = buildTiles('cost', {
  'cost-this-month': formatCurrency(costTotalsThisMonth().cost),
  'cost-per-run': formatCurrency(averageCostPerRun(costTotalsThisMonth())),
  'tokens-this-month': formatTokens(costTotalsThisMonth().tokens),
  'highest-cost-agent': highestCostAgent().name,
})
