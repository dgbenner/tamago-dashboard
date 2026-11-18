// Types for the dashboard's mock data. All data is mock data in the JSON files beside this file.
// Import everything from '@/data', never from a JSON file directly.
//
// Sections: Content health (Phase 1) · Shared (periods, stat tiles, chart series) · Growth · Health ·
// Agents (shared by Agent activity and Cost) · Agent activity · Cost

/** A calendar day as an ISO string, 'YYYY-MM-DD'. */
export type IsoDate = string

// ══ Content health (Phase 1) ═════════════════════════════════════════════════

// ── Stat cards ───────────────────────────────────────────────────────────────

/** The four stat cards, in the order they appear on the page. */
export type StatId = 'languages-live' | 'a1-coverage' | 'drafts-waiting' | 'failed-checks'

/** How a stat's values are shown: a whole number, or a percent from 0 to 100. */
export type StatUnit = 'count' | 'percent'

/** One day's value in a stat's sparkline. */
export interface StatPoint {
  /** The day, 'YYYY-MM-DD'. */
  date: IsoDate
  /** The value on that day. For unit 'percent' this is 0–100, at most one decimal. */
  value: number
}

/** One stat card. The current value is not stored: use `currentValue(stat)`. */
export interface Stat {
  /** Stable key, also the key into `statDescriptions`. */
  id: StatId
  /** Card title, e.g. "Drafts waiting". */
  label: string
  /** How to format the values. */
  unit: StatUnit
  /** 14 daily points, oldest first, 2026-11-04 to 2026-11-17. The last point is today. */
  series: StatPoint[]
}

// ── Deploys table ────────────────────────────────────────────────────────────

/** 'blocked' exactly when some checks failed, otherwise 'live'. */
export type DeployResult = 'live' | 'blocked'

/** One deploy (one build). */
export interface Deploy {
  /** Stable key, the animal name in lower case, e.g. 'aardvark'. */
  id: string
  /** The deploy's name. Deploys are named after animals, e.g. "Aardvark". */
  animal: string
  /** The day of the deploy, 'YYYY-MM-DD'. */
  date: IsoDate
  /** The git branch it was built from, e.g. 'main' or 'content/pt-a1'. */
  branch: string
  /** How many checks passed in the build. */
  checksPassed: number
  /** How many checks ran in the build. */
  checksTotal: number
  /** Derived in index.ts from the two check counts, never stored in the JSON. */
  result: DeployResult
}

// ── Languages table ──────────────────────────────────────────────────────────

/** French is 'complete'; the other five are 'in-progress'. */
export type LanguageStatus = 'complete' | 'in-progress'

/** The deploy that last changed a language. Always one of the rows in `deploys`. */
export interface LastDeploy {
  /** The `id` of the matching row in `deploys`. */
  id: string
  /** The deploy's animal name, e.g. "Aardvark". */
  animal: string
  /** The day of that deploy, 'YYYY-MM-DD'. */
  date: IsoDate
}

/** One row of the languages table. */
export interface Language {
  /** Stable key, e.g. 'french'. */
  id: string
  /** Display name, e.g. "French". */
  name: string
  /** Whether the A1 course is finished. Show it with `languageStatusLabels`. */
  status: LanguageStatus
  /** Number of circles (lesson groups) built. */
  circles: number
  /** Number of sentences in the course. */
  sentences: number
  /** A1 coverage on the main path, as a percent from 0 to 100. */
  a1Coverage: number
  /** Drafts waiting for a native speaker to check. */
  draftsWaiting: number
  /** Candidates waiting for review by Fable. */
  candidatesWaiting: number
  /** The most recent deploy that included this language, resolved from `deploys` in index.ts. */
  lastDeploy: LastDeploy
}

// ══ Shared by the four newer pages ═══════════════════════════════════════════

/** A wall-clock date and time as an ISO string with no time zone, 'YYYY-MM-DDTHH:mm:ss'. */
export type IsoDateTime = string

/** A run of days, both ends included. */
export interface Period {
  /** First day, 'YYYY-MM-DD'. */
  start: IsoDate
  /** Last day, 'YYYY-MM-DD'. */
  end: IsoDate
}

/** The fixed date boundaries every "this week" / "this month" number is computed from. */
export interface Periods {
  /** Today, 2026-11-17. */
  today: IsoDate
  /** The last 7 days, 2026-11-11 to 2026-11-17. */
  thisWeek: Period
  /** The month to date, 2026-11-01 to 2026-11-17. */
  thisMonth: Period
  /** 2026-11-04 to 2026-11-17: the response-time chart and the runs-per-day chart. */
  last14Days: Period
  /** 2026-10-19 to 2026-11-17: the cost-per-day chart. */
  last30Days: Period
}

/**
 * One stat card on the Growth, Health, Agent activity and Cost pages. Each page exports four, in page
 * order (`growthStatCards`, `healthStatCards`, `activityStatCards`, `costStatCards`). No sparkline.
 */
export interface StatTile {
  /** Stable key, e.g. 'lessons'. Use it as the React key. */
  id: string
  /** Card title, e.g. "Lessons". */
  label: string
  /** The value, already formatted for display, e.g. "726", "99.92%", "$84.31", "Builder 1". */
  value: string
  /** A short line under the title, e.g. "Last 7 days". */
  description: string
}

/** One line or bar series of a chart: `id` is the key into each chart row, `name` is the legend text. */
export interface ChartSeries {
  id: string
  name: string
}

// ══ Growth ═══════════════════════════════════════════════════════════════════

/** The six language ids, the same as `languages[].id`. */
export type LanguageId = 'french' | 'spanish' | 'italian' | 'german' | 'portuguese' | 'dutch'

/**
 * One week of the lessons line chart: the cumulative number of lessons in each language at the end of
 * that week. Keyed by language id, so it is ready for a multi-line chart.
 */
export type LessonsWeek = { /** Week-ending day, 'YYYY-MM-DD'. */ date: IsoDate } & Record<LanguageId, number>

/** One row of the Growth table (one per language, same order as `languages`). */
export interface GrowthRow {
  /** Language id, e.g. 'french'. */
  id: LanguageId
  /** Display name, e.g. "French". */
  name: string
  /** Lessons added in the latest week: the last weekly point minus the one before. */
  addedThisWeek: number
  /** Lessons added this month: the last weekly point minus the latest point before the month began. */
  addedThisMonth: number
  /** Total lessons now: the last weekly point. */
  totalLessons: number
}

// ══ Health ═══════════════════════════════════════════════════════════════════

/** One day of the response-time line chart. */
export interface ResponseTimePoint {
  date: IsoDate
  /** That day's response time in milliseconds. Format with `formatMs`. */
  ms: number
}

/** One day of uptime checks (a check every 5 minutes; today is a part day). */
export interface UptimeDay {
  date: IsoDate
  /** Checks made that day. */
  checks: number
  /** Checks that failed that day. */
  failed: number
}

export type AuditResult = 'pass' | 'fail'

/** One row of the audits table. */
export interface Audit {
  /** Stable key, e.g. 'word-audit'. */
  id: string
  /** Display name, e.g. "Word audit". */
  name: string
  /** When it last ran. Format with `formatDateTime`. */
  lastRun: IsoDateTime
  /** Show it with `auditResultLabels`. */
  result: AuditResult
}

// ══ Agents (one source for Agent activity and Cost) ═══════════════════════════

export type AgentId = 'builder-1' | 'builder-2' | 'fable' | 'debugger'

export interface Agent {
  id: AgentId
  /** Display name: "Builder 1", "Builder 2", "Fable", "Debugger". */
  name: string
}

/** What one agent did on one day. There is a record for every agent on every day, zeros included. */
export interface AgentDay {
  date: IsoDate
  agentId: AgentId
  /** Runs started that day. */
  runs: number
  /** Tokens used that day. Format with `formatTokens`. */
  tokens: number
  /** Cost that day in US dollars, to the cent. Format with `formatCurrency`. */
  cost: number
}

/** Per-day counts that belong to no single row of `AgentDay`. */
export interface AgentDayEvents {
  date: IsoDate
  /** Items Fable flagged in its reviews that day. */
  itemsFlagged: number
  /** Runs (any agent) stopped by a stop rule that day. */
  runsStopped: number
}

/** Totals over any set of `AgentDay` records. */
export interface AgentTotals {
  runs: number
  tokens: number
  /** US dollars, to the cent. */
  cost: number
}

// ══ Agent activity ═══════════════════════════════════════════════════════════

/** Only Fable's runs can be 'flagged'. */
export type RunResult = 'done' | 'flagged' | 'stopped'

/** One row of the last-20-runs table. */
export interface AgentRun {
  /** Stable key, e.g. 'run-0420'. */
  id: string
  /** When the run started. Format with `formatDateTime`. */
  startedAt: IsoDateTime
  agentId: AgentId
  /** The agent's display name, resolved from `agents`. */
  agentName: string
  /** What the run was for, e.g. "Review Italian Part 3 candidates". */
  task: string
  /** Show it with `runResultLabels`. */
  result: RunResult
  /** How long the run took. Format with `formatDuration`. */
  durationSeconds: number
}

/** One day of the stacked runs-per-day bar chart: the number of runs by each agent, keyed by agent id. */
export type RunsByDayPoint = { date: IsoDate } & Record<AgentId, number>

// ══ Cost ═════════════════════════════════════════════════════════════════════

/** One day of the cost-per-day bar chart. */
export interface CostByDayPoint {
  date: IsoDate
  /** Total cost of all agents that day in US dollars, to the cent. */
  cost: number
}

/** One row of the Cost table (one per agent, this month). */
export interface AgentCostRow extends AgentTotals {
  id: AgentId
  /** Display name, e.g. "Builder 1". */
  name: string
  /** cost / runs in US dollars, to the cent; 0 when there were no runs. */
  averageCostPerRun: number
}
