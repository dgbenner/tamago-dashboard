// Growth page (a placeholder page, mock data): lessons per language by week, the per-language table
// rows and the four stat cards. Its mock language list (growthLanguages.json) stays inside this
// module; the real languages are in ./real-content.

import growthLanguagesJson from './growthLanguages.json'
import lessonsWeeklyJson from './lessonsWeekly.json'
import { formatCount, formatPercent } from './format'
import { addDays, check, oneOf } from './internal'
import { periods, today } from './periods'
import { buildTiles } from './tiles'
import type { ChartSeries, GrowthRow, LanguageId, LessonsWeek, StatTile } from './types'

/** The mock languages behind the Growth placeholder numbers. Not exported. */
const languages: { id: string; name: string; sentences: number; a1Coverage: number }[] = growthLanguagesJson

/** Average mock A1 coverage across the mock languages, rounded to one decimal. */
function averageA1Coverage(): number {
  const sum = languages.reduce((total, row) => total + row.a1Coverage, 0)
  return Math.round((sum / languages.length) * 10) / 10
}

const LANGUAGE_IDS = ['french', 'spanish', 'italian', 'german', 'portuguese', 'dutch'] as const satisfies readonly LanguageId[]

/**
 * Line chart data: 12 weekly points, oldest first, the last one today. Each row is
 * `{ date, french, spanish, italian, german, portuguese, dutch }` with the cumulative lesson count
 * of each language at that week's end. Use `lessonsSeries` for the lines.
 */
export const lessonsWeekly: LessonsWeek[] = lessonsWeeklyJson satisfies LessonsWeek[]

/** The six lines of the lessons chart: `{ id, name }` per mock language. */
export const lessonsSeries: ChartSeries[] = languages.map((language) => ({
  id: oneOf(LANGUAGE_IDS, language.id, 'language id'),
  name: language.name,
}))

check(lessonsSeries.length === LANGUAGE_IDS.length, 'lessonsWeekly.json and growthLanguages.json list different languages')
check(lessonsWeekly[lessonsWeekly.length - 1].date === today, 'the last week of lessonsWeekly.json must end today')
lessonsWeekly.forEach((week, i) => {
  if (i === 0) return
  const before = lessonsWeekly[i - 1]
  check(week.date === addDays(before.date, 7), `lessonsWeekly.json: ${week.date} is not 7 days after ${before.date}`)
  for (const id of LANGUAGE_IDS) check(week[id] >= before[id], `lessonsWeekly.json: ${id} goes down on ${week.date}`)
})

const latestWeek = lessonsWeekly[lessonsWeekly.length - 1]
const previousWeek = lessonsWeekly[lessonsWeekly.length - 2]
/** The latest weekly point dated before this month began. */
const lastWeekBeforeMonth = lessonsWeekly.findLast((week) => week.date < periods.thisMonth.start) ?? lessonsWeekly[0]

/** Table rows, one per mock language: added this week, this month, and total. */
export const growthRows: GrowthRow[] = lessonsSeries.map(({ id, name }) => {
  const languageId = id as LanguageId
  return {
    id: languageId,
    name,
    addedThisWeek: latestWeek[languageId] - previousWeek[languageId],
    addedThisMonth: latestWeek[languageId] - lastWeekBeforeMonth[languageId],
    totalLessons: latestWeek[languageId],
  }
})

/** Lessons in all languages together: the sum of `growthRows[].totalLessons`. */
export function totalLessons(rows: GrowthRow[] = growthRows): number {
  return rows.reduce((total, row) => total + row.totalLessons, 0)
}

/** Sentences in all mock languages together. */
export function totalSentences(): number {
  return languages.reduce((total, language) => total + language.sentences, 0)
}

/** The Growth page's four stat cards, in page order: Languages, Lessons, Sentences, A1 words covered. */
export const growthStatCards: StatTile[] = buildTiles('growth', {
  languages: formatCount(languages.length),
  lessons: formatCount(totalLessons()),
  sentences: formatCount(totalSentences()),
  'a1-words-covered': formatPercent(averageA1Coverage()),
})
