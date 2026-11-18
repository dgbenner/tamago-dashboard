// The only entry point to the mock data: import from '@/data'. Types are in ./types.
//
// CONTENT HEALTH (./content)
//   Data:     stats, languages, deploys, latestDeploy
//   Labels:   languageStatusLabels, deployResultLabels, statDescriptions
//   Helpers:  getStat, currentValue, previousValue, formatStatValue, failedChecks, deployResult,
//             formatChecks, averageA1Coverage, totalDraftsWaiting, totalCandidatesWaiting
//
// PERIODS (./periods) — the dates every "this week" / "this month" number is computed from
//   periods ({ today, thisWeek, thisMonth, last14Days, last30Days }), today, isInPeriod, inPeriod
//
// GROWTH (./growth)
//   Stat cards:  growthStatCards: StatTile[]
//   Line chart:  lessonsWeekly: LessonsWeek[] (12 weeks, { date, french, spanish, … }),
//                lessonsSeries: ChartSeries[] ({ id, name } per language)
//   Table:       growthRows: GrowthRow[]
//   Helpers:     totalLessons, totalSentences
//
// HEALTH (./health)
//   Stat cards:  healthStatCards: StatTile[]
//   Line chart:  responseTimes: ResponseTimePoint[] (14 days, { date, ms })
//   Table:       audits: Audit[], auditResultLabels
//   Helpers:     averageResponseTime, uptimeChecks, uptimePercent, deploysThisWeek
//
// AGENTS (./agents) — one source for the two pages below
//   agents, agentSeries, agentName, agentDaily, agentDailyEvents, sumAgentDays, averageCostPerRun
//
// AGENT ACTIVITY (./activity)
//   Stat cards:  activityStatCards: StatTile[]
//   Bar chart:   runsByDay: RunsByDayPoint[] (14 days, { date, 'builder-1', 'builder-2', fable, debugger }),
//                agentSeries: ChartSeries[]
//   Table:       agentRuns: AgentRun[] (last 20, newest first), runResultLabels
//   Helpers:     runsThisWeek, fableReviewsThisWeek, itemsFlaggedThisWeek, runsStoppedThisWeek
//
// COST (./cost)
//   Stat cards:  costStatCards: StatTile[]
//   Bar chart:   costByDay: CostByDayPoint[] (30 days, { date, cost })
//   Table:       agentCostRows: AgentCostRow[] (one per agent, this month)
//   Helpers:     costTotalsThisMonth, highestCostAgent
//
// FORMATTERS (./format) — pages never format a number or date themselves
//   formatCount "2,179" · formatDelta "+8" · formatPercent "70.3%" · formatUptime "99.92%" ·
//   formatCurrency "$1,234.56" · formatTokens "48.2M" · formatMs "142 ms" · formatDuration "4m 12s" ·
//   formatDate "Nov 16, 2026" · formatShortDate "Nov 16" · formatTime "2:05 PM" ·
//   formatDateTime "Nov 17, 2:05 PM"

export type * from './types'

export * from './content'
export * from './periods'
export * from './growth'
export * from './health'
export { agents, agentSeries, agentName, agentDaily, agentDailyEvents, sumAgentDays, averageCostPerRun } from './agents'
export * from './activity'
export * from './cost'
export * from './format'
