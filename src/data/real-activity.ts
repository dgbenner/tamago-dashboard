// Agent activity page (real): commits, pushes and deploys per day, the reviews applied and the four
// stat cards, read from the snapshot. What the snapshot cannot know is listed in `activityNotRecorded`.

import labelsJson from './labels.json'
import { formatCount } from './format'
import { addDays, check, fill } from './internal'
import { LAST_DAYS } from './snapshot'
import { dayOf, snapshot, snapshotDay } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { ActivityDay, ChartSeries, ReviewApplied, StatTile } from './types'

const activity = snapshot.activity

// ── Days ─────────────────────────────────────────────────────────────────────

/** One row per day, oldest first, ending on the day the snapshot was taken. */
export const activityByDay: ActivityDay[] = activity.days.map(({ date, commits, pushes, deploys }) => ({ date, commits, pushes, deploys }))

check(activityByDay.length >= LAST_DAYS, `snapshot.activity.days has ${activityByDay.length} days, fewer than ${LAST_DAYS}`)
check(activityByDay[activityByDay.length - 1].date === snapshotDay, 'snapshot.activity.days must end on the day the snapshot was taken')
activityByDay.forEach((day, i) => {
  if (i > 0) check(day.date === addDays(activityByDay[i - 1].date, 1), `snapshot.activity.days: ${day.date} does not follow ${activityByDay[i - 1].date}`)
  check(Number.isInteger(day.commits) && Number.isInteger(day.deploys), `snapshot.activity.days ${day.date}: commits and deploys must be whole numbers`)
  check(day.pushes === null || Number.isInteger(day.pushes), `snapshot.activity.days ${day.date}: pushes must be a whole number or null`)
})

/** Whether no day at all has a push count (the push record could not be read). */
const pushesMissing = activityByDay.every((day) => day.pushes === null)

/** The bars of the activity chart: Commits, Pushes, Deploys. Pushes is left out when no day has a count. */
export const activitySeries: ChartSeries[] = (['commits', 'pushes', 'deploys'] as const)
  .filter((id) => id !== 'pushes' || !pushesMissing)
  .map((id) => ({ id, name: labelsJson.activitySeries[id] }))

/** The last 7 rows of `activityByDay`: "the last 7 days", ending on the snapshot day. */
export const lastDays: ActivityDay[] = activityByDay.slice(-LAST_DAYS)

/** "Last 7 days", or with an all-time total "Last 7 days; 274 in all". The 7 is `LAST_DAYS`. */
export function lastDaysLabel(total: number | null): string {
  const days = formatCount(LAST_DAYS)
  return total === null ? fill(labelsJson.lastDays.plain, { days }) : fill(labelsJson.lastDays.withTotal, { days, total: formatCount(total) })
}

// ── Reviews applied ──────────────────────────────────────────────────────────

/** Every review applied to the course, newest first. */
export const reviewsApplied: ReviewApplied[] = activity.reviewsApplied.map(({ date, subject }) => ({ date, subject }))

reviewsApplied.forEach((review, i) => {
  if (i > 0) check(Date.parse(review.date) <= Date.parse(reviewsApplied[i - 1].date), `snapshot.activity.reviewsApplied: "${review.subject}" is out of order`)
})

// ── What is not recorded ─────────────────────────────────────────────────────

/**
 * Plain names of what the snapshot has no source for, e.g. "which agent did the work". Built from
 * the keys of snapshot.activity that are null, so an entry goes away when its source appears.
 */
export const activityNotRecorded: string[] = [
  ...(pushesMissing ? [labelsJson.activityNotRecorded.pushes] : []),
  ...(['runsByAgent', 'runDurations', 'itemsFlagged', 'runsStopped'] as const)
    .filter((key) => activity[key] === null)
    .map((key) => labelsJson.activityNotRecorded[key]),
]

// ── Stat cards ───────────────────────────────────────────────────────────────

const lastDates = new Set(lastDays.map((day) => day.date))

/** The sum of the last 7 days' pushes, or null if any of those days has no count. */
function pushesLastDays(): number | null {
  let total = 0
  for (const day of lastDays) {
    if (day.pushes === null) return null
    total += day.pushes
  }
  return total
}

const pushes = pushesLastDays()

/**
 * The Agent activity page's four stat cards, in page order: Commits, Pushes, Deploys, Reviews
 * applied. Each value is the last-7-days figure; the description adds the all-time total where the
 * snapshot has one.
 */
export const activityStatTiles: StatTile[] = buildRealTiles('activity', {
  commits: {
    value: formatCount(lastDays.reduce((total, day) => total + day.commits, 0)),
    vars: { period: lastDaysLabel(activity.commitsTotal) },
  },
  pushes: {
    value: pushes === null ? null : formatCount(pushes),
    vars: { period: lastDaysLabel(null) },
  },
  deploys: {
    value: formatCount(lastDays.reduce((total, day) => total + day.deploys, 0)),
    vars: { period: lastDaysLabel(activity.deploysTotal) },
  },
  'reviews-applied': {
    value: formatCount(reviewsApplied.filter((review) => lastDates.has(dayOf(review.date))).length),
    vars: { period: lastDaysLabel(reviewsApplied.length) },
  },
})
