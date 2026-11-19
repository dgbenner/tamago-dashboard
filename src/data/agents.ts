// The mock agents and what they did each day, for the Cost page (a placeholder page).

import agentDailyJson from './agentDaily.json'
import agentsJson from './agents.json'
import { check, daysBetween, oneOf } from './internal'
import { periods } from './periods'
import type { Agent, AgentDay, AgentId, AgentTotals, ChartSeries } from './types'

export const AGENT_IDS = ['builder-1', 'builder-2', 'fable', 'debugger'] as const satisfies readonly AgentId[]

/** The four agents in display order: Builder 1, Builder 2, Fable, Debugger. */
export const agents: Agent[] = agentsJson.map((agent) => ({
  ...agent,
  id: oneOf(AGENT_IDS, agent.id, 'agent id'),
}))

/** The agents as chart series `{ id, name }`. */
export const agentSeries: ChartSeries[] = agents

/** An agent's display name, e.g. 'builder-1' → "Builder 1". */
export function agentName(id: AgentId): string {
  const agent = agents.find((a) => a.id === id)
  if (!agent) throw new Error(`src/data: no agent with id "${id}"`)
  return agent.name
}

type AgentDayJson = Omit<AgentDay, 'agentId'> & { agentId: string }

/**
 * One record per day per agent for the last 30 days (2026-10-19 to 2026-11-17), oldest day first,
 * agents in display order within a day: runs, tokens, cost. 120 records, zero days included.
 */
export const agentDaily: AgentDay[] = (agentDailyJson satisfies AgentDayJson[]).map((day) => ({
  ...day,
  agentId: oneOf(AGENT_IDS, day.agentId, `agentDaily ${day.date} agentId`),
}))

const last30Days = daysBetween(periods.last30Days.start, periods.last30Days.end)
check(
  agentDaily.map((day) => `${day.date} ${day.agentId}`).join() ===
    last30Days.flatMap((date) => AGENT_IDS.map((id) => `${date} ${id}`)).join(),
  'agentDaily.json must have one row per agent for each of the last 30 days, in order',
)
for (const day of agentDaily) {
  check(day.runs > 0 || (day.tokens === 0 && day.cost === 0), `agentDaily ${day.date} ${day.agentId}: cost without runs`)
}

/** Sum runs, tokens and cost over any set of daily records. Cost is added in cents, so it stays exact. */
export function sumAgentDays(days: AgentDay[]): AgentTotals {
  let runs = 0
  let tokens = 0
  let cents = 0
  for (const day of days) {
    runs += day.runs
    tokens += day.tokens
    cents += Math.round(day.cost * 100)
  }
  return { runs, tokens, cost: cents / 100 }
}

/** cost / runs in US dollars, rounded to the cent; 0 when there were no runs. */
export function averageCostPerRun(totals: Pick<AgentTotals, 'runs' | 'cost'>): number {
  return totals.runs === 0 ? 0 : Math.round((totals.cost / totals.runs) * 100) / 100
}
