// Agent activity page: runs per day by agent, the last 20 runs and the four stat cards.

import agentRunsJson from './agentRuns.json'
import labelsJson from './labels.json'
import { AGENT_IDS, agentDaily, agentDailyEvents, agentName, sumAgentDays } from './agents'
import { formatCount } from './format'
import { check, daysBetween, oneOf } from './internal'
import { inPeriod, periods } from './periods'
import { buildTiles } from './tiles'
import type { AgentRun, RunResult, RunsByDayPoint, StatTile } from './types'

const RUN_RESULTS = ['done', 'flagged', 'stopped'] as const satisfies readonly RunResult[]

// ── Runs per day ─────────────────────────────────────────────────────────────

/**
 * Stacked bar chart data: one row per day for the last 14 days, oldest first,
 * `{ date, 'builder-1': n, 'builder-2': n, fable: n, debugger: n }`. Use `agentSeries` for the bars.
 */
export const runsByDay: RunsByDayPoint[] = daysBetween(periods.last14Days.start, periods.last14Days.end).map((date) => {
  const point: RunsByDayPoint = { date, 'builder-1': 0, 'builder-2': 0, fable: 0, debugger: 0 }
  for (const day of agentDaily) if (day.date === date) point[day.agentId] = day.runs
  return point
})

// ── Last 20 runs ─────────────────────────────────────────────────────────────

type AgentRunJson = Omit<AgentRun, 'agentId' | 'agentName' | 'result'> & { agentId: string; result: string }

/** The last 20 runs, newest first. They agree with `agentDaily` for the days they cover. */
export const agentRuns: AgentRun[] = (agentRunsJson satisfies AgentRunJson[]).map((run) => {
  const agentId = oneOf(AGENT_IDS, run.agentId, `${run.id}.agentId`)
  const result = oneOf(RUN_RESULTS, run.result, `${run.id}.result`)
  check(result !== 'flagged' || agentId === 'fable', `${run.id}: only Fable's runs can be flagged`)
  return { ...run, agentId, agentName: agentName(agentId), result }
})

agentRuns.forEach((run, i) => {
  if (i > 0) check(run.startedAt < agentRuns[i - 1].startedAt, `agentRuns.json: ${run.id} is out of order`)
})

// The listed runs must match the daily table. The oldest listed day may be cut off by the limit of
// 20, so it only has to stay within that day's count; every later day must match exactly.
{
  const oldestDay = agentRuns[agentRuns.length - 1].startedAt.slice(0, 10)
  const newestDay = agentRuns[0].startedAt.slice(0, 10)
  const listed = (date: string) => agentRuns.filter((run) => run.startedAt.slice(0, 10) === date)
  const dayTotal = (date: string) => sumAgentDays(agentDaily.filter((day) => day.date === date)).runs
  const oldestDayIsComplete = listed(oldestDay).length === dayTotal(oldestDay)
  check(newestDay === periods.today, 'agentRuns.json: the newest run must be from today')
  for (const date of daysBetween(oldestDay, newestDay)) {
    const complete = date !== oldestDay || oldestDayIsComplete
    for (const day of agentDaily.filter((d) => d.date === date)) {
      const count = listed(date).filter((run) => run.agentId === day.agentId).length
      check(complete ? count === day.runs : count <= day.runs, `agentRuns.json: ${date} ${day.agentId} has ${count} runs listed, agentDaily.json says ${day.runs}`)
    }
    if (!complete) continue
    const events = agentDailyEvents.find((e) => e.date === date)
    const stopped = listed(date).filter((run) => run.result === 'stopped').length
    const flagged = listed(date).filter((run) => run.result === 'flagged').length
    check(events?.runsStopped === stopped, `agentRuns.json: ${date} has ${stopped} stopped runs, agentDailyEvents.json disagrees`)
    check((events.itemsFlagged > 0) === (flagged > 0) && events.itemsFlagged >= flagged, `agentRuns.json: ${date} flagged runs disagree with agentDailyEvents.json`)
  }
}

/** Badge text for a run result: done → "Done", flagged → "Flagged", stopped → "Stopped". */
export const runResultLabels: Record<RunResult, string> = labelsJson.runResult

// ── This week ────────────────────────────────────────────────────────────────

/** Runs by all agents this week (the last 7 days). */
export function runsThisWeek(): number {
  return sumAgentDays(inPeriod(agentDaily, periods.thisWeek)).runs
}

/** Fable's runs this week: each one is a review. */
export function fableReviewsThisWeek(): number {
  return sumAgentDays(inPeriod(agentDaily, periods.thisWeek).filter((day) => day.agentId === 'fable')).runs
}

/** Items Fable flagged this week. */
export function itemsFlaggedThisWeek(): number {
  return inPeriod(agentDailyEvents, periods.thisWeek).reduce((total, day) => total + day.itemsFlagged, 0)
}

/** Runs stopped by a stop rule this week. */
export function runsStoppedThisWeek(): number {
  return inPeriod(agentDailyEvents, periods.thisWeek).reduce((total, day) => total + day.runsStopped, 0)
}

/**
 * The Agent activity page's four stat cards, in page order: Agent runs this week, Fable reviews,
 * Items Fable flagged, Runs stopped by a stop rule.
 */
export const activityStatCards: StatTile[] = buildTiles('activity', {
  'agent-runs': formatCount(runsThisWeek()),
  'fable-reviews': formatCount(fableReviewsThisWeek()),
  'items-flagged': formatCount(itemsFlaggedThisWeek()),
  'runs-stopped': formatCount(runsStoppedThisWeek()),
})
