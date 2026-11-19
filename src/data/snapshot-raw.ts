// Reads the two generated files (snapshot.json, snapshot-history.json; written by `npm run snapshot`,
// never by hand) and checks their shape. Not re-exported from '@/data': pages use ./snapshot and the
// real-* modules, which are built on this one.
//
// A `null` in the snapshot means "no real source". It is carried through as null and reaches the page
// as a label ("Not measured yet" / "Not recorded"), never as 0.

import historyJson from './snapshot-history.json'
import snapshotJson from './snapshot.json'
import { check, offsetMinutes, toWallClock } from './internal'
import type { IsoDate } from './types'

export interface SnapshotLanguageJson {
  id: string
  name: string
  state: string
  status: string | null
  partsLive: number | null
  partsTotal: number | null
  circles: number | null
  sentences: number | null
  sentencesTatoeba: number | null
  sentencesDrafted: number | null
  coverage: { list: string; scope: string; taught: number; total: number; percent: number } | null
  draftsWaiting: number | null
  lastDeploy: { number: number; name: string; date: string } | null
}

export interface SnapshotDeployJson {
  number: number
  name: string
  date: string
  commit: string
  changes: string[]
  changesHidden: number
  test: { result: string; tests: number | null; passed: number | null; failed: number | null }
}

export interface SnapshotFullSuiteJson {
  result: string
  startedAt: string
  finishedAt: string
  durationSeconds: number
  tests: number | null
  passed: number | null
  failed: number | null
  skipped: number | null
  commit: string
  deploy: { number: number; name: string } | null
  runsRecorded: number
}

export interface SnapshotJson {
  takenAt: string
  source: { repo: string; branch: string; commit: string; commitDate: string }
  languages: SnapshotLanguageJson[]
  deploys: SnapshotDeployJson[]
  health: {
    fullSuite: SnapshotFullSuiteJson | null
    auditNote: { date: string; entry: string | null } | null
    // No source exists for these today, so the snapshot holds null. See real-health.ts.
    audits: unknown
    smokeTest: unknown
    fastTier: unknown
    uptimePercent: unknown
    responseTimeMs: unknown
  }
  activity: {
    days: { date: string; commits: number; pushes: number | null; deploys: number }[]
    firstCommit: string
    commitsTotal: number | null
    deploysTotal: number | null
    reviewsApplied: { date: string; subject: string }[]
    // No source exists for these today, so the snapshot holds null. See real-activity.ts.
    runsByAgent: unknown
    runDurations: unknown
    itemsFlagged: unknown
    runsStopped: unknown
  }
}

export interface SnapshotHistoryEntryJson {
  takenAt: string
  languagesLive: number | null
  sentences: number | null
  circles: number | null
  draftsWaiting: number | null
  coveragePercentAverage: number | null
  deployNumber: number | null
  testsPassed: number | null
  testsFailed: number | null
  commitsTotal: number | null
  languages: Record<string, { sentences: number | null; circles: number | null; draftsWaiting: number | null; coveragePercent: number | null }>
}

/** The current snapshot, exactly as generated. */
export const snapshot: SnapshotJson = snapshotJson

/** One entry per snapshot taken, oldest first. The last entry is the current snapshot. */
export const history: SnapshotHistoryEntryJson[] = historyJson

const TAKEN_AT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}([+-]\d{2}:\d{2})$/

const takenAtMatch = TAKEN_AT.exec(snapshot.takenAt)
if (!takenAtMatch) {
  throw new Error(`src/data: snapshot.takenAt is "${snapshot.takenAt}", expected a time with an offset like 2026-11-19T14:44:00-06:00`)
}

/** The snapshot's own time zone, as minutes east of UTC. Every time on a page is shown in this zone. */
export const snapshotOffsetMinutes: number = offsetMinutes(takenAtMatch[1])

/** A date or date-time from the snapshot → wall-clock digits in the snapshot's zone. See `toWallClock`. */
export function wallClock(value: string): string {
  return toWallClock(value, snapshotOffsetMinutes)
}

/** The calendar day of a date or date-time from the snapshot, in the snapshot's zone. */
export function dayOf(value: string): IsoDate {
  return wallClock(value).slice(0, 10)
}

/** The day the snapshot was taken. */
export const snapshotDay: IsoDate = dayOf(snapshot.takenAt)

check(Array.isArray(snapshot.languages) && snapshot.languages.length > 0, 'snapshot.languages is empty')
check(Array.isArray(snapshot.deploys), 'snapshot.deploys is not a list')
check(typeof snapshot.health === 'object' && snapshot.health !== null, 'snapshot.health is missing')
check(typeof snapshot.activity === 'object' && snapshot.activity !== null, 'snapshot.activity is missing')

check(Array.isArray(history) && history.length > 0, 'snapshot-history.json has no entries')
history.forEach((entry, i) => {
  check(TAKEN_AT.test(entry.takenAt), `snapshot-history.json entry ${i + 1} has takenAt "${entry.takenAt}"`)
  if (i > 0) check(Date.parse(entry.takenAt) > Date.parse(history[i - 1].takenAt), `snapshot-history.json: entry ${i + 1} is not later than the one before`)
})
check(
  history[history.length - 1].takenAt === snapshot.takenAt,
  'the last entry of snapshot-history.json is not the current snapshot.json (run `npm run snapshot` again)',
)
