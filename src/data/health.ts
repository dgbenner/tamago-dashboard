// Health page: daily response time, uptime checks, the audits table and the four stat cards.

import auditsJson from './audits.json'
import labelsJson from './labels.json'
import responseTimesJson from './responseTimes.json'
import uptimeChecksJson from './uptimeChecks.json'
import { deploys, formatChecks, latestDeploy } from './content'
import { formatCount, formatMs, formatUptime } from './format'
import { check, daysBetween, oneOf } from './internal'
import { inPeriod, periods } from './periods'
import { buildTiles } from './tiles'
import type { Audit, AuditResult, Deploy, ResponseTimePoint, StatTile, UptimeDay } from './types'

const AUDIT_RESULTS = ['pass', 'fail'] as const satisfies readonly AuditResult[]

// ── Response time ────────────────────────────────────────────────────────────

/** Line chart data: one `{ date, ms }` per day for the last 14 days, oldest first. */
export const responseTimes: ResponseTimePoint[] = responseTimesJson satisfies ResponseTimePoint[]

check(
  responseTimes.map((point) => point.date).join() === daysBetween(periods.last14Days.start, periods.last14Days.end).join(),
  'responseTimes.json must have one row for each of the last 14 days, in order',
)

/** Mean response time over the 14 days, in ms, rounded to a whole number. */
export function averageResponseTime(points: ResponseTimePoint[] = responseTimes): number {
  if (points.length === 0) return 0
  return Math.round(points.reduce((total, point) => total + point.ms, 0) / points.length)
}

// ── Uptime ───────────────────────────────────────────────────────────────────

/** Uptime checks per day for the month to date, oldest first: checks made and checks failed. */
export const uptimeChecks: UptimeDay[] = uptimeChecksJson satisfies UptimeDay[]

check(
  uptimeChecks.map((day) => day.date).join() === daysBetween(periods.thisMonth.start, periods.thisMonth.end).join(),
  'uptimeChecks.json must have one row for each day of the month to date, in order',
)

/** Uptime this month as a 0–100 percent (not rounded): checks that passed / checks made. */
export function uptimePercent(days: UptimeDay[] = inPeriod(uptimeChecks, periods.thisMonth)): number {
  const made = days.reduce((total, day) => total + day.checks, 0)
  const failed = days.reduce((total, day) => total + day.failed, 0)
  return made === 0 ? 100 : ((made - failed) / made) * 100
}

// ── Deploys ──────────────────────────────────────────────────────────────────

/** The rows of `deploys` dated within this week (the last 7 days). */
export function deploysThisWeek(): Deploy[] {
  return inPeriod(deploys, periods.thisWeek)
}

// ── Audits ───────────────────────────────────────────────────────────────────

type AuditJson = Omit<Audit, 'result'> & { result: string }

/** The audits table rows, most recently run first. */
export const audits: Audit[] = (auditsJson satisfies AuditJson[])
  .map((audit) => ({ ...audit, result: oneOf(AUDIT_RESULTS, audit.result, `${audit.id}.result`) }))
  .sort((a, b) => b.lastRun.localeCompare(a.lastRun))

/** Badge text for an audit result: pass → "Pass", fail → "Fail". */
export const auditResultLabels: Record<AuditResult, string> = labelsJson.auditResult

// ── Stat cards ───────────────────────────────────────────────────────────────

/**
 * The Health page's four stat cards, in page order: Uptime this month, Average response time,
 * Checks passed (in the last build), Deploys this week.
 */
export const healthStatCards: StatTile[] = buildTiles('health', {
  uptime: formatUptime(uptimePercent()),
  'response-time': formatMs(averageResponseTime()),
  'checks-passed': formatChecks(latestDeploy),
  'deploys-this-week': formatCount(deploysThisWeek().length),
})
