// Content health page (real): the languages, the recent deploys and the four stat cards, all read
// from the snapshot. Nothing here is typed in or estimated: a null in the snapshot stays null.

import labelsJson from './labels.json'
import { formatCount, formatPercent } from './format'
import { check, fill, oneOf } from './internal'
import { NOT_RECORDED, fullTestRunLabel, trendOf } from './snapshot'
import { snapshot } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { Coverage, DeployTestResult, LanguageState, RealDeploy, RealLanguage, StatTile } from './types'

const LANGUAGE_STATES = ['live', 'coming-soon'] as const satisfies readonly LanguageState[]
const COURSE_STATUSES = ['complete', 'in-progress'] as const
const DEPLOY_TEST_RESULTS = ['passed', 'failed', 'running', 'not-recorded'] as const satisfies readonly DeployTestResult[]

/** The scope the snapshot writes when a course is measured against its whole list. */
const FULL_LIST_SCOPE = 'full list'

// ── Languages ────────────────────────────────────────────────────────────────

const allLanguages: RealLanguage[] = snapshot.languages.map((language) => {
  const where = `snapshot.languages ${language.id}`
  const state = oneOf(LANGUAGE_STATES, language.state, `${where}.state`)
  const status = language.status === null ? null : oneOf(COURSE_STATUSES, language.status, `${where}.status`)
  check(typeof language.name === 'string' && language.name !== '', `${where} has no name`)
  check(state === 'coming-soon' || status !== null, `${where} is live but has no status`)
  check(state === 'live' || status === null, `${where} is coming soon but has a status`)
  return { ...language, state, status }
})

check(new Set(allLanguages.map((l) => l.id)).size === allLanguages.length, 'snapshot.languages repeats a language id')

/** The languages that are public in the app, in the snapshot's order. */
export const liveLanguages: RealLanguage[] = allLanguages.filter((l) => l.state === 'live')

/** The languages the app lists as coming soon, in the snapshot's order. */
export const comingSoonLanguages: RealLanguage[] = allLanguages.filter((l) => l.state === 'coming-soon')

/** Every language: the live ones first, then the coming-soon ones. */
export const realLanguages: RealLanguage[] = [...liveLanguages, ...comingSoonLanguages]

/** Badge text: complete → "Complete", in-progress → "In progress", coming-soon → "Coming Soon". */
export const realLanguageStatusLabels: Record<'complete' | 'in-progress' | 'coming-soon', string> = labelsJson.realLanguageStatus

/** The key into `realLanguageStatusLabels` for a language. */
export function languageStatusKey(language: RealLanguage): 'complete' | 'in-progress' | 'coming-soon' {
  if (language.state === 'coming-soon' || language.status === null) return 'coming-soon'
  return language.status
}

/** Parts live out of parts planned, e.g. "6 of 6". "" for coming soon (or when not in the snapshot). */
export function formatParts(language: RealLanguage): string {
  if (language.partsLive === null || language.partsTotal === null) return ''
  return fill(labelsJson.parts, { live: formatCount(language.partsLive), total: formatCount(language.partsTotal) })
}

/** The list a coverage figure is measured against, e.g. "FLELex, core 600" or "Goethe-Institut". */
export function coverageListLabel(coverage: Coverage): string {
  return coverage.scope === FULL_LIST_SCOPE
    ? fill(labelsJson.coverageList.fullList, { list: coverage.list })
    : fill(labelsJson.coverageList.scoped, { list: coverage.list, scope: coverage.scope })
}

// ── Deploys ──────────────────────────────────────────────────────────────────

/** The most recent deploys, newest first, as in the snapshot. */
export const recentDeploys: RealDeploy[] = snapshot.deploys.map((deploy) => ({
  ...deploy,
  test: { ...deploy.test, result: oneOf(DEPLOY_TEST_RESULTS, deploy.test.result, `snapshot.deploys ${deploy.number}.test.result`) },
}))

recentDeploys.forEach((deploy, i) => {
  if (i > 0) check(deploy.number < recentDeploys[i - 1].number, `snapshot.deploys: ${deploy.number} is not older than the deploy before it`)
})

/** Badge text for a deploy's test run: "Passed", "Failed", "Running", "Not recorded". */
export const deployTestLabels: Record<DeployTestResult, string> = { ...labelsJson.deployTest, 'not-recorded': NOT_RECORDED }

/** A deploy's test counts, e.g. "259/259". "" when the snapshot has no counts for it. */
export function formatDeployTest(deploy: RealDeploy): string {
  const { passed, tests } = deploy.test
  if (passed === null || tests === null) return ''
  return fill(labelsJson.deployTestCounts, { passed: formatCount(passed), tests: formatCount(tests) })
}

// ── Stat cards ───────────────────────────────────────────────────────────────

/** The sum of one number over the live languages, or null if any of them has no value for it. */
function sumOverLive(read: (language: RealLanguage) => number | null): number | null {
  let total = 0
  for (const language of liveLanguages) {
    const value = read(language)
    if (value === null) return null
    total += value
  }
  return total
}

/**
 * The average of each live course's own coverage percent, rounded to one decimal. null when there
 * is no live course or any live course has no coverage figure (an average of the rest would mislead).
 */
function averageCoveragePercent(): number | null {
  const sum = sumOverLive((language) => language.coverage?.percent ?? null)
  if (sum === null || liveLanguages.length === 0) return null
  return Math.round((sum / liveLanguages.length) * 10) / 10
}

const coverageAverage = averageCoveragePercent()
const draftsWaitingTotal = sumOverLive((language) => language.draftsWaiting)
const failedChecks = snapshot.health.fullSuite?.failed ?? null

/**
 * The Content health page's four stat cards, in page order: Languages live, A1 coverage,
 * Drafts waiting, Failed checks.
 */
export const contentStatTiles: StatTile[] = buildRealTiles('content', {
  'languages-live': {
    value: formatCount(liveLanguages.length),
    vars: { comingSoon: formatCount(comingSoonLanguages.length) },
    trend: trendOf('languagesLive'),
  },
  'a1-coverage': {
    value: coverageAverage === null ? null : formatPercent(coverageAverage),
    trend: trendOf('coveragePercentAverage'),
  },
  'drafts-waiting': {
    value: draftsWaitingTotal === null ? null : formatCount(draftsWaitingTotal),
    trend: trendOf('draftsWaiting'),
  },
  'failed-checks': {
    value: failedChecks === null ? null : formatCount(failedChecks),
    vars: { run: fullTestRunLabel() },
    trend: trendOf('testsFailed'),
  },
})
