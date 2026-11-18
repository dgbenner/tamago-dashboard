// Content health page (Phase 1): deploys, languages, the four sparkline stats and their labels.

import deploysJson from './deploys.json'
import labelsJson from './labels.json'
import languagesJson from './languages.json'
import statsJson from './stats.json'
import { formatCount, formatPercent } from './format'
import { oneOf } from './internal'
import type {
  Deploy,
  DeployResult,
  Language,
  LanguageStatus,
  Stat,
  StatId,
  StatUnit,
} from './types'

// ── Checking the JSON ────────────────────────────────────────────────────────
// TypeScript reads a JSON string as plain `string`, so the fields and numbers are checked when
// compiling (`satisfies` below) and the fixed sets of words ('complete', 'percent', …) are checked
// with `oneOf` when the module loads.

const STAT_IDS = ['languages-live', 'a1-coverage', 'drafts-waiting', 'failed-checks'] as const satisfies readonly StatId[]
const STAT_UNITS = ['count', 'percent'] as const satisfies readonly StatUnit[]
const LANGUAGE_STATUSES = ['complete', 'in-progress'] as const satisfies readonly LanguageStatus[]

// ── Deploys ──────────────────────────────────────────────────────────────────

/** 'blocked' exactly when at least one check failed. */
export function deployResult(deploy: Pick<Deploy, 'checksPassed' | 'checksTotal'>): DeployResult {
  return deploy.checksPassed < deploy.checksTotal ? 'blocked' : 'live'
}

/** The last 10 deploys, newest first. `result` is worked out from the check counts. */
export const deploys: Deploy[] = (deploysJson satisfies Omit<Deploy, 'result'>[]).map((d) => ({
  ...d,
  result: deployResult(d),
}))

/** The most recent deploy (the first row of `deploys`). */
export const latestDeploy: Deploy = deploys[0]

/** How many checks failed in a deploy: total minus passed. */
export function failedChecks(deploy: Pick<Deploy, 'checksPassed' | 'checksTotal'>): number {
  return deploy.checksTotal - deploy.checksPassed
}

/** Checks as shown in the deploys table, e.g. "203/204". */
export function formatChecks(deploy: Pick<Deploy, 'checksPassed' | 'checksTotal'>): string {
  return `${deploy.checksPassed}/${deploy.checksTotal}`
}

// ── Languages ────────────────────────────────────────────────────────────────

type LanguageJson = Omit<Language, 'status' | 'lastDeploy'> & { status: string; lastDeployId: string }

/** One row per language, in display order: French, Spanish, Italian, German, Portuguese, Dutch. */
export const languages: Language[] = (languagesJson satisfies LanguageJson[]).map(
  ({ lastDeployId, status, ...row }) => {
    const deploy = deploys.find((d) => d.id === lastDeployId)
    if (!deploy) throw new Error(`src/data: ${row.id} points at unknown deploy "${lastDeployId}"`)
    return {
      ...row,
      status: oneOf(LANGUAGE_STATUSES, status, `${row.id}.status`),
      lastDeploy: { id: deploy.id, animal: deploy.animal, date: deploy.date },
    }
  },
)

/** Average A1 coverage across all language rows, rounded to one decimal. */
export function averageA1Coverage(rows: Language[] = languages): number {
  if (rows.length === 0) return 0
  const sum = rows.reduce((total, row) => total + row.a1Coverage, 0)
  return Math.round((sum / rows.length) * 10) / 10
}

/** Sum of drafts waiting for a native speaker across all language rows. */
export function totalDraftsWaiting(rows: Language[] = languages): number {
  return rows.reduce((total, row) => total + row.draftsWaiting, 0)
}

/** Sum of candidates waiting for Fable across all language rows. */
export function totalCandidatesWaiting(rows: Language[] = languages): number {
  return rows.reduce((total, row) => total + row.candidatesWaiting, 0)
}

// ── Stats ────────────────────────────────────────────────────────────────────

type StatJson = Omit<Stat, 'id' | 'unit'> & { id: string; unit: string }

/** The four stat cards, in page order, each with its 14-day series. */
export const stats: Stat[] = (statsJson satisfies StatJson[]).map((s) => ({
  ...s,
  id: oneOf(STAT_IDS, s.id, 'stat id'),
  unit: oneOf(STAT_UNITS, s.unit, `${s.id}.unit`),
}))

/** Look up one stat by id. */
export function getStat(id: StatId): Stat {
  const stat = stats.find((s) => s.id === id)
  if (!stat) throw new Error(`src/data: no stat with id "${id}"`)
  return stat
}

/** A stat's current value: the last point of its series (today). */
export function currentValue(stat: Stat): number {
  return stat.series[stat.series.length - 1].value
}

/** A stat's value the day before today: the second-to-last point of its series. */
export function previousValue(stat: Stat): number {
  return stat.series[Math.max(0, stat.series.length - 2)].value
}

// ── Labels ───────────────────────────────────────────────────────────────────

/** Badge text for a language status: complete → "Complete", in-progress → "In progress". */
export const languageStatusLabels: Record<LanguageStatus, string> = labelsJson.languageStatus

/** Badge text for a deploy result: live → "Live", blocked → "Blocked". */
export const deployResultLabels: Record<DeployResult, string> = labelsJson.deployResult

/** A short line under each stat card's title, e.g. drafts-waiting → "For a native speaker". */
export const statDescriptions: Record<StatId, string> = labelsJson.statDescription

// ── Formatting a stat ────────────────────────────────────────────────────────

/** Format any value of a stat by its unit. With no value, formats the stat's current value. */
export function formatStatValue(stat: Stat, value: number = currentValue(stat)): string {
  return stat.unit === 'percent' ? formatPercent(value) : formatCount(value)
}
