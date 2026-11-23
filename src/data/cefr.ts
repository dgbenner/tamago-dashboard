// The CEFR page: reference content from cefr.json, plus the few live numbers it shows, from the snapshot. The
// reference text is typed here, not measured: the page cites its sources in the footer.

import cefrJson from './cefr.json'
import { formatCount } from './format'
import { check, fill } from './internal'
import { languageStatusKey, liveLanguages } from './real-content'

export type CefrGroupId = 'basic' | 'independent' | 'proficient'
const GROUP_IDS = ['basic', 'independent', 'proficient'] as const

/** The CEFR levels in order, lowest first. */
export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const
const rank = (level: string | null) => (level === null ? -1 : CEFR_LEVELS.indexOf(level as (typeof CEFR_LEVELS)[number]))

export interface CefrGroup {
  id: CefrGroupId
  /** "Basic user" */
  name: string
  /** "Basic", for the chip on a level card */
  short: string
  levels: string[]
}

export interface CefrLevel {
  code: string
  name: string
  group: CefrGroupId
  canDo: string
  /** "90–100 h", shown after the approximation mark */
  hours: string
  /** The accent badge, on the highest level any live course has completed. null on the others. */
  tamagoBadge: string | null
}

export const cefrHeader = cefrJson.header

export const cefrGroups: CefrGroup[] = cefrJson.groups.map((group) => {
  check((GROUP_IDS as readonly string[]).includes(group.id), `src/data/cefr.json: unknown group "${group.id}"`)
  return { ...group, id: group.id as CefrGroupId }
})

// ── The ladder ──────────────────────────────────────────────────────────────

/** Live courses with every part live, and the highest level they reach. */
const completeCourses = liveLanguages.filter((l) => languageStatusKey(l) === 'complete')
const topLevel = completeCourses.reduce<string | null>((top, l) => (rank(l.level) > rank(top) ? l.level : top), null)
const atTopLevel = completeCourses.filter((l) => l.level === topLevel).length

const ladderText = cefrJson.ladder
const tamagoBadge =
  topLevel === null
    ? null
    : atTopLevel === liveLanguages.length
      ? fill(ladderText.tamagoBadgeAll, { count: formatCount(atTopLevel) })
      : fill(ladderText.tamagoBadgeSome, { count: formatCount(atTopLevel), live: formatCount(liveLanguages.length) })

export const cefrLadder = {
  title: ladderText.title,
  intro: ladderText.intro,
  /** The approximation mark shown before every hours figure. */
  approx: ladderText.approx,
  footnote: ladderText.footnote,
  levels: ladderText.levels.map((level): CefrLevel => {
    check(cefrGroups.some((g) => g.id === level.group), `src/data/cefr.json: level ${level.code} has unknown group "${level.group}"`)
    return {
      ...level,
      group: level.group as CefrGroupId,
      hours: fill(ladderText.hoursLabel, { hours: level.hours }),
      tamagoBadge: level.code === topLevel ? tamagoBadge : null,
    }
  }),
}

// ── Same level, different distance (FSI) ────────────────────────────────────

const distanceText = cefrJson.distance

/**
 * One bar per live course with an FSI category, in category order then by name. Each row holds two values under its
 * own category's keys: `<cat>Low` (the bar up to the lower figure) and `<cat>Extra` (the rest of a range, drawn
 * lighter). The other categories' keys are left out, so the bars stack in one slot.
 */
export interface DistanceRow {
  id: string
  name: string
  category: string
  hours: string
  [key: string]: string | number
}

export const distanceCategories = distanceText.categories.map(({ id, name, hours, note }) => ({ id, name, hours, note: note ?? null }))

export const distanceRows: DistanceRow[] = distanceText.categories.flatMap((category) =>
  liveLanguages
    .filter((l) => category.languages.includes(l.id))
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((l) => ({
      id: l.id,
      name: l.name,
      category: category.id,
      hours: fill(distanceText.hoursLabel, { hours: category.hours }),
      [`${category.id}Low`]: category.low,
      [`${category.id}Extra`]: category.high - category.low,
    })),
)

export const cefrDistance = {
  title: distanceText.title,
  intro: distanceText.intro,
  axisLabel: distanceText.axisLabel,
  caption: distanceText.caption,
  note: distanceText.note,
}

// ── Vocabulary ──────────────────────────────────────────────────────────────

const vocabText = cefrJson.vocabulary
const liveWords = liveLanguages.map((l) => l.words).filter((n): n is number => n !== null)
const minWords = liveWords.length ? Math.min(...liveWords) : null
const maxWords = liveWords.length ? Math.max(...liveWords) : null

/** The vocabulary bars: the two research figures, then Tamago's own range from the snapshot (when it has one). */
export interface VocabRow {
  id: string
  label: string
  words: string
  low: number
  extra: number
  tamago: boolean
}

export const vocabRows: VocabRow[] = [
  ...vocabText.bars.map((bar) => ({ id: bar.id, label: bar.label, words: bar.words, low: bar.low, extra: bar.high - bar.low, tamago: false })),
  ...(minWords !== null && maxWords !== null
    ? [{
        id: 'tamago',
        label: vocabText.tamagoBar,
        words: fill(vocabText.wordsLabel, { words: `${formatCount(minWords)}–${formatCount(maxWords)}` }),
        low: minWords,
        extra: maxWords - minWords,
        tamago: true,
      }]
    : []),
]

export const cefrVocabulary = {
  title: vocabText.title,
  headline: vocabText.headline,
  facts: vocabText.facts,
  axisLabel: vocabText.axisLabel,
  /** "Tamago's A1 courses teach 934–1,568 words.", or null when the snapshot has no word counts. */
  tamago: minWords !== null && maxWords !== null ? fill(vocabText.tamago, { min: formatCount(minWords), max: formatCount(maxWords) }) : null,
  caveat: vocabText.caveat,
}

// ── Exams ───────────────────────────────────────────────────────────────────

/** One part of an exam cell: the exam's name and, if it has one, its footnote number. */
export interface ExamPart {
  text: string
  note: number | null
}

export interface ExamRow {
  id: string
  name: string
  /** One cell per CEFR level, A1 to C2. An empty cell has no parts. */
  cells: ExamPart[][]
}

const examText = cefrJson.exams
const examById = new Map(examText.rows.map((row) => [row.id, row]))

/** In the same order as the Languages table on Content Health. Only courses in the app with exam data. */
export const examRows: ExamRow[] = liveLanguages.flatMap((l) => {
  const row = examById.get(l.id)
  if (!row) return []
  check(row.cells.length === CEFR_LEVELS.length, `src/data/cefr.json: exams for ${l.id} need ${CEFR_LEVELS.length} cells`)
  return [{ id: l.id, name: l.name, cells: row.cells.map((cell) => cell.map((part) => ({ text: part.text, note: 'note' in part ? (part.note as number) : null }))) }]
})

export const cefrExams = {
  title: examText.title,
  intro: examText.intro,
  tamagoColumn: examText.tamagoColumn,
  /** The column Tamago's mock exams follow: the highest level any course has completed. */
  tamagoLevel: topLevel,
  footnotes: examText.footnotes,
}

// ── Tamago today ────────────────────────────────────────────────────────────

const todayText = cefrJson.today

export interface TodayChip {
  id: string
  name: string
  /** "A1 complete", "A1–A2 complete" or "A2, incomplete" */
  level: string | null
  /** "103 circles" */
  circles: string | null
}

export const todayChips: TodayChip[] = liveLanguages.map((l) => {
  const complete = languageStatusKey(l) === 'complete'
  const level =
    l.level === null
      ? null
      : !complete
        ? fill(todayText.incomplete, { level: l.level })
        : rank(l.level) > 0
          ? fill(todayText.completeRange, { level: l.level })
          : fill(todayText.complete, { level: l.level })
  return { id: l.id, name: l.name, level, circles: l.circles === null ? null : fill(todayText.circles, { count: formatCount(l.circles) }) }
})

const awaitingCourses = liveLanguages.filter((l) => (l.draftsWaiting ?? 0) > 0)
const awaitingSentences = awaitingCourses.reduce((n, l) => n + (l.draftsWaiting ?? 0), 0)

export const cefrToday = {
  title: todayText.title,
  intro: todayText.intro,
  /** "Every course in the app is A1-complete." or "7 of 9 courses in the app are A1-complete." null with no live course. */
  summary:
    topLevel === null || liveLanguages.length === 0
      ? null
      : atTopLevel === liveLanguages.length
        ? fill(todayText.allComplete, { level: topLevel })
        : fill(todayText.someComplete, { complete: formatCount(atTopLevel), live: formatCount(liveLanguages.length), level: topLevel }),
  /** The awaiting-check line in three parts, the middle one a link. null when nothing is waiting. */
  awaiting:
    awaitingCourses.length === 0
      ? null
      : {
          before: fill(todayText.awaitingBefore, { sentences: formatCount(awaitingSentences), courses: formatCount(awaitingCourses.length) }),
          link: todayText.awaitingLink,
          after: todayText.awaitingAfter,
        },
}

export const cefrSources = cefrJson.sources
