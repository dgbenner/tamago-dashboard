// Content health page (real): the languages, the recent deploys and the four stat cards, all read
// from the snapshot. Nothing here is typed in or estimated: a null in the snapshot stays null.

import labelsJson from './labels.json'
import { formatCount } from './format'
import { check, fill, oneOf } from './internal'
import { NOT_RECORDED, fullTestRunLabel, trendOf } from './snapshot'
import { snapshot } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { Coverage, DeployTestResult, LanguageState, RealDeploy, RealLanguage, StatTile } from './types'

const LANGUAGE_STATES = ['live', 'started', 'coming-soon'] as const satisfies readonly LanguageState[]
const COURSE_STATUSES = ['complete', 'incomplete', 'started'] as const
const DEPLOY_TEST_RESULTS = ['passed', 'failed', 'cancelled', 'running', 'not-recorded'] as const satisfies readonly DeployTestResult[]

/** The scope the snapshot writes when a course is measured against its whole list. */
const FULL_LIST_SCOPE = 'full list'

// ── Languages ────────────────────────────────────────────────────────────────

const allLanguages: RealLanguage[] = snapshot.languages.map((language) => {
  const where = `snapshot.languages ${language.id}`
  const state = oneOf(LANGUAGE_STATES, language.state, `${where}.state`)
  const status = language.status === null ? null : oneOf(COURSE_STATUSES, language.status, `${where}.status`)
  check(typeof language.name === 'string' && language.name !== '', `${where} has no name`)
  check(state === 'coming-soon' || status !== null, `${where} has content but no status`)
  check(state !== 'coming-soon' || status === null, `${where} is planned but has a status`)
  check((state === 'started') === (status === 'started'), `${where}: only a course not yet open in the app is started`)
  return { ...language, state, status }
})

check(new Set(allLanguages.map((l) => l.id)).size === allLanguages.length, 'snapshot.languages repeats a language id')

/**
 * The default order on load (Dan, 2026-11-19): Live, then Live, Incomplete, then In Progress, then Planned,
 * and alphabetical by name within each.
 */
const STATUS_ORDER = { complete: 0, incomplete: 1, started: 2 } as const
const byStatusThenName = (a: RealLanguage, b: RealLanguage) =>
  (a.status === null ? 3 : STATUS_ORDER[a.status]) - (b.status === null ? 3 : STATUS_ORDER[b.status]) || a.name.localeCompare(b.name)
allLanguages.sort(byStatusThenName)

/** The languages that are public in the app: Live first, then Live, Incomplete; alphabetical within each. */
export const liveLanguages: RealLanguage[] = allLanguages.filter((l) => l.state === 'live')

/** The languages the app lists as coming soon, in the snapshot's order. */
export const comingSoonLanguages: RealLanguage[] = allLanguages.filter((l) => l.state === 'coming-soon')

/** Languages with content pushed but not open in the app yet ("In Progress"), in the snapshot's order. */
export const startedLanguages: RealLanguage[] = allLanguages.filter((l) => l.state === 'started')

/** The languages that have content: open in the app first, then started. These rows have numbers. */
export const languagesWithContent: RealLanguage[] = [...liveLanguages, ...startedLanguages]

/** Every language: open in the app, then started, then planned. */
export const realLanguages: RealLanguage[] = [...liveLanguages, ...startedLanguages, ...comingSoonLanguages]

export type LanguageStatusKey = 'complete' | 'incomplete' | 'started' | 'coming-soon'

/** Badge text: complete → "Live", incomplete → "Live, Incomplete", started → "In Progress", coming-soon → "Planned". */
export const realLanguageStatusLabels: Record<LanguageStatusKey, string> = labelsJson.realLanguageStatus

/** The key into `realLanguageStatusLabels` for a language. */
export function languageStatusKey(language: RealLanguage): LanguageStatusKey {
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
 * Live courses where every part is live: the same test as the Status column (languageStatusKey).
 * null when there is no live course.
 */
const coursesComplete = liveLanguages.length === 0 ? null : liveLanguages.filter((language) => languageStatusKey(language) === 'complete').length
const draftsWaitingTotal = sumOverLive((language) => language.draftsWaiting)
const failedChecks = snapshot.health.fullSuite?.failed ?? null

/**
 * The Content health page's four stat cards, in page order: Languages live, Courses complete,
 * Awaiting native check, Failed checks.
 */
export const contentStatTiles: StatTile[] = buildRealTiles('content', {
  'languages-live': {
    value: formatCount(liveLanguages.length),
    vars: { comingSoon: formatCount(comingSoonLanguages.length) },
    trend: trendOf('languagesLive'),
  },
  'courses-complete': {
    value: coursesComplete === null ? null : fill(labelsJson.coursesComplete, { complete: formatCount(coursesComplete), live: formatCount(liveLanguages.length) }),
    trend: trendOf('coursesComplete'),
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

// ── Column help ──────────────────────────────────────────────────────────────

/** The Languages tables' column keys that have an explanation. */
export type LanguageColumnHelpKey = keyof typeof labelsJson.columnHelp

/** What each Languages column means, for the tooltip beside its heading. */
export const languageColumnHelp: Record<LanguageColumnHelpKey, string> = labelsJson.columnHelp
