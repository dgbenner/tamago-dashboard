// Health page (real): the four stat cards and the checks table, read from the snapshot. Most of
// Health has no real source yet; those rows and cards say "Not measured yet" and explain why.

import labelsJson from './labels.json'
import { formatCount, formatDate, formatDuration } from './format'
import { check, fill, oneOf } from './internal'
import { lastDays, lastDaysLabel } from './real-activity'
import { NOT_MEASURED, deployName, fullTestRunLabel, trendOf } from './snapshot'
import { snapshot } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { HealthCheck, HealthCheckResult, StatTile } from './types'

const FULL_SUITE_RESULTS = ['passed', 'failed'] as const

const health = snapshot.health
const fullSuite = health.fullSuite
const fullSuiteResult = fullSuite ? oneOf(FULL_SUITE_RESULTS, fullSuite.result, 'snapshot.health.fullSuite.result') : null

// These five have no source, so the snapshot holds null and the page says "Not measured yet". If
// the snapshot script starts recording one, this module has to be taught how to read it: stop
// loudly instead of showing a stale "Not measured yet" beside a real number.
for (const key of ['audits', 'smokeTest', 'fastTier', 'uptimePercent', 'responseTimeMs'] as const) {
  check(health[key] === null, `snapshot.health.${key} now has a value, but real-health.ts only knows it as "not measured". Ask the data agent to read it.`)
}

/** Badge text for a check's result: "Pass", "Fail", "Not measured yet". */
export const healthCheckResultLabels: Record<HealthCheckResult, string> = { ...labelsJson.healthCheckResult, 'not-measured': NOT_MEASURED }

// ── Checks table ─────────────────────────────────────────────────────────────

const checkTexts = labelsJson.healthChecks

/** e.g. "259 of 259 tests in 22m 23s, on Dolphin 58". Every number comes from snapshot.health.fullSuite. */
function fullSuiteDetail(): string {
  const text = checkTexts['full-suite']
  if (!fullSuite) return text.none
  const counts =
    fullSuite.passed === null || fullSuite.tests === null
      ? text.noCounts
      : fill(text.counts, { passed: formatCount(fullSuite.passed), tests: formatCount(fullSuite.tests) })
  const detail = fill(text.withDuration, { counts, duration: formatDuration(fullSuite.durationSeconds) })
  return fullSuite.deploy ? fill(text.onDeploy, { detail, deploy: deployName(fullSuite.deploy) }) : detail
}

/** The build log's sentence about the audits, kept as a note. It is not a measurement. */
function auditsDetail(): string {
  const note = health.auditNote
  if (!note || !note.entry) return checkTexts.audits.detail
  return fill(checkTexts.audits.detailWithNote, { date: formatDate(note.date), entry: note.entry })
}

function notMeasured(id: 'smoke' | 'fast-tier' | 'uptime' | 'response-time'): HealthCheck {
  return { id, name: checkTexts[id].name, lastRun: null, result: 'not-measured', detail: checkTexts[id].detail }
}

/**
 * The checks table, in page order: full-suite, audits, smoke, fast-tier, uptime, response-time.
 * Only the full test suite is measured.
 */
export const healthChecks: HealthCheck[] = [
  {
    id: 'full-suite',
    name: checkTexts['full-suite'].name,
    lastRun: fullSuite ? fullSuite.finishedAt : null,
    result: fullSuiteResult === null ? 'not-measured' : fullSuiteResult === 'passed' ? 'pass' : 'fail',
    detail: fullSuiteDetail(),
  },
  { id: 'audits', name: checkTexts.audits.name, lastRun: null, result: 'not-measured', detail: auditsDetail() },
  notMeasured('smoke'),
  notMeasured('fast-tier'),
  notMeasured('uptime'),
  notMeasured('response-time'),
]

// ── Stat cards ───────────────────────────────────────────────────────────────

const checksPassed =
  fullSuite && fullSuite.passed !== null && fullSuite.tests !== null
    ? fill(labelsJson.deployTestCounts, { passed: formatCount(fullSuite.passed), tests: formatCount(fullSuite.tests) })
    : null

/**
 * The Health page's four stat cards, in page order: Uptime this month and Average response time
 * (neither is measured), Checks passed (the full test run), Deploys this week (the last 7 days).
 */
export const healthStatTiles: StatTile[] = buildRealTiles('health', {
  uptime: { value: null },
  'response-time': { value: null },
  'checks-passed': { value: checksPassed, vars: { run: fullTestRunLabel() }, trend: trendOf('testsPassed') },
  'deploys-this-week': {
    value: formatCount(lastDays.reduce((total, day) => total + day.deploys, 0)),
    vars: { period: lastDaysLabel(null) },
  },
})
