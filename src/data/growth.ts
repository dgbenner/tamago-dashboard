// Content Growth page (real, from the snapshot): lessons per course over time, the per-course table and the four
// stat cards. The snapshot reads each course's lessons from its units.json at past versions of Tamago's main branch;
// lessons are first recorded on 2026-11-10, so the chart starts there.

import { formatCount, formatDate } from './format'
import labelsJson from './labels.json'
import { check } from './internal'
import { liveLanguages } from './real-content'
import { trendOf } from './snapshot'
import { snapshot } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { ChartSeries, GrowthRow, LessonsDay, StatTile } from './types'

const growth = snapshot.growth
check(Boolean(growth), 'src/data: the snapshot has no growth section; run npm run snapshot')

const byName = (a: { name: string }, b: { name: string }) => a.name.localeCompare(b.name)

/** The chart's lines: one per live course, alphabetical. Each id is a key in the `lessonsByDay` rows. */
export const lessonsSeries: ChartSeries[] = growth.languages.map(({ id, name }) => ({ id, name })).sort(byName)

/**
 * The line chart's rows, oldest first: one per day from the first day any course recorded its lessons to the
 * snapshot day, `{ date, fr, es, … }`. A course with no record that day holds null, so no point is drawn.
 */
export const lessonsByDay: LessonsDay[] = growth.days
  .filter((day) => growth.firstMeasured !== null && day.date >= growth.firstMeasured)
  .map((day) => ({ date: day.date, ...day.lessons }))

/** The table's rows, one per live course, alphabetical. */
export const growthRows: GrowthRow[] = growth.languages
  .map((language) => ({
    id: language.id,
    name: language.name,
    addedThisWeek: language.newThisWeek,
    addedThisMonth: language.newThisMonth,
    totalLessons: language.totalLessons,
  }))
  .sort(byName)

/** A sum over the rows, or null when any row has no value (a total of the rest would mislead). */
function sum(read: (row: GrowthRow) => number | null): number | null {
  let total = 0
  for (const row of growthRows) {
    const value = read(row)
    if (value === null) return null
    total += value
  }
  return growthRows.length ? total : null
}

const sentences = liveLanguages.every((language) => language.sentences !== null)
  ? liveLanguages.reduce((total, language) => total + (language.sentences ?? 0), 0)
  : null
const monthStart = `${snapshot.takenAt.slice(0, 7)}-01`
const value = (n: number | null) => (n === null ? null : formatCount(n))

/** The page's four stat cards: Total Lessons, New Lessons This Week, New Lessons This Month, Sentences. */
export const growthStatCards: StatTile[] = buildRealTiles('growth', {
  'total-lessons': { value: value(sum((row) => row.totalLessons)), vars: { courses: formatCount(growthRows.length) }, trend: trendOf('lessons') },
  'new-this-week': { value: value(sum((row) => row.addedThisWeek)) },
  'new-this-month': { value: value(sum((row) => row.addedThisMonth)), vars: { monthStart: formatDate(monthStart) } },
  sentences: { value: value(sentences), vars: { courses: formatCount(liveLanguages.length) }, trend: trendOf('sentences') },
})

/** The content-hierarchy legend beside the page title: Tamago's six levels, largest first, each with a definition
 * and an example. Text only; nothing here is measured. */
export interface HierarchyLevel {
  name: string
  definition: string
  example: string
}
export const contentHierarchy: { levels: HierarchyLevel[] } = labelsJson.contentHierarchy
check(contentHierarchy.levels.length === 6, 'src/data/labels.json: contentHierarchy needs the six levels')
