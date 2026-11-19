// What every real page shares: the two "no number" labels, when the snapshot was taken and from
// where, and trends from the snapshot history.

import labelsJson from './labels.json'
import { formatDate, formatTime } from './format'
import { check, fill } from './internal'
import { history, snapshot, type SnapshotHistoryEntryJson } from './snapshot-raw'
import type { IsoDateTime, TrendPoint } from './types'

/** Shown in place of a number that has no real source: "Not measured yet". */
export const NOT_MEASURED: string = labelsJson.notMeasured

/** Shown for a deploy with no test run on record: "Not recorded". */
export const NOT_RECORDED: string = labelsJson.notRecorded

/** When the snapshot was taken, as written in snapshot.json, e.g. '2026-11-19T14:44:00-06:00'. */
export const snapshotTakenAt: IsoDateTime = snapshot.takenAt

/** The same moment for people, e.g. "Nov 19, 2026, 2:44 PM". Read from the digits as written. */
export const snapshotLabel: string = `${formatDate(snapshot.takenAt)}, ${formatTime(snapshot.takenAt)}`

check(
  [snapshot.source.repo, snapshot.source.branch, snapshot.source.commit].every((text) => typeof text === 'string' && text !== ''),
  'snapshot.source needs a repo, a branch and a commit',
)

/** The repository, branch and commit the snapshot was read from. */
export const snapshotSource: { repo: string; branch: string; commit: string } = {
  repo: snapshot.source.repo,
  branch: snapshot.source.branch,
  commit: snapshot.source.commit,
}

type HistoryNumberField = {
  [K in keyof SnapshotHistoryEntryJson]-?: NonNullable<SnapshotHistoryEntryJson[K]> extends number ? K : never
}[keyof SnapshotHistoryEntryJson]

/** The fewest snapshots a trend needs. With fewer, there is no trend and pages show the number alone. */
const TREND_MIN_SNAPSHOTS = 2

/**
 * One history field as a trend, oldest first. `null` until the history holds two snapshots (and when
 * fewer than two of them have a value for this field). Snapshots with no value are left out, never
 * filled in.
 */
export function trendOf(field: HistoryNumberField): TrendPoint[] | null {
  if (history.length < TREND_MIN_SNAPSHOTS) return null
  const points: TrendPoint[] = []
  for (const entry of history) {
    const value = entry[field]
    if (typeof value === 'number') points.push({ takenAt: entry.takenAt, value })
  }
  return points.length >= TREND_MIN_SNAPSHOTS ? points : null
}

/** A deploy as text, e.g. "Dolphin 58". */
export function deployName(deploy: { name: string; number: number }): string {
  return fill(labelsJson.deployName, { name: deploy.name, number: String(deploy.number) })
}

/** The line that names the full test run, e.g. "Full test run, Dolphin 58". */
export function fullTestRunLabel(): string {
  const run = snapshot.health.fullSuite
  if (!run) return labelsJson.fullTestRun.none
  return run.deploy ? fill(labelsJson.fullTestRun.withDeploy, { deploy: deployName(run.deploy) }) : labelsJson.fullTestRun.withoutDeploy
}

/** How many of the latest days "the last N days" covers. */
export const LAST_DAYS = 7
