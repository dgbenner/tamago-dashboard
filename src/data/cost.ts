// Cost page (real, from the snapshot): Claude Code tokens in the sessions that worked on Tamago. Token counts are
// measured; dollars are not, because no billing source is connected, so the two cost cards say "Not measured yet".

import { formatCount, formatDate, formatDateTime, formatPercent, formatTokens } from './format'
import labelsJson from './labels.json'
import { fill } from './internal'
import { trendOf } from './snapshot'
import { snapshot } from './snapshot-raw'
import { buildRealTiles } from './tiles'
import type { ChartSeries, StatTile } from './types'

const usage = snapshot.usage
const week = usage?.week ?? null
const weekModels = week?.models ?? []

/** A model id as people read it: "claude-opus-5-5" → "Opus 5.5". labels.json names the known ones. */
export function modelName(id: string): string {
  const known = (labelsJson.usage.models as Record<string, string>)[id]
  if (known) return known
  const [family = id, ...version] = id.replace(/^claude-/, '').split('-')
  return `${family.charAt(0).toUpperCase()}${family.slice(1)}${version.length ? ` ${version.join('.')}` : ''}`
}

/** The chart's series: one per model, the week's busiest first (so the colors follow use). */
const dayModelIds = [...new Set((usage?.days ?? []).flatMap((day) => Object.keys(day.models)))]
const order = new Map(weekModels.map((m, i) => [m.model, i]))
export const tokenSeries: ChartSeries[] = dayModelIds
  .sort((a, b) => (order.get(a) ?? 99) - (order.get(b) ?? 99) || a.localeCompare(b))
  .map((id) => ({ id, name: modelName(id) }))

/** Bar chart rows: one per day, oldest first, `{ date, <model id>: tokens }`. Empty when nothing was measured. */
export const tokensByDay: Array<{ date: string } & Record<string, number | string>> = (usage?.days ?? []).map((day) => ({
  date: day.date,
  ...Object.fromEntries(tokenSeries.map((s) => [s.id, day.models[s.id] ?? 0])),
}))

/** Table rows: one per model, this week, busiest first. */
export interface TokenRow {
  id: string
  name: string
  output: number
  input: number
  cacheWrite: number
  cacheRead: number
  total: number
}
export const tokenRows: TokenRow[] = weekModels.map((m) => ({
  id: m.model,
  name: modelName(m.model),
  output: m.output,
  input: m.input,
  cacheWrite: m.cacheWrite,
  cacheRead: m.cacheRead,
  total: m.total,
}))

const weekTotal = week ? weekModels.reduce((n, m) => n + m.total, 0) : null
const weekCacheRead = week ? weekModels.reduce((n, m) => n + m.cacheRead, 0) : null
const top = weekModels[0] ?? null

/** When the count is older than the snapshot (the GitHub run keeps the Mac's last count), the card says when. */
const measuredNote =
  usage && usage.measuredAt !== snapshot.takenAt ? fill(labelsJson.usage.measured, { date: formatDate(usage.measuredAt) }) : ''

/** The table's description, and its scope line: how many sessions this week, and when they were counted. */
export const tokenTableText = {
  description: labelsJson.usage.tableDescription,
  /** "7 sessions; counted Nov 23, 10:39 AM.", or null before the first count. */
  scope: usage ? fill(labelsJson.usage.tableScope, { sessions: formatCount(week?.sessions ?? 0), measuredAt: formatDateTime(usage.measuredAt) }) : null,
}

/**
 * The Cost page's four stat cards, in page order: Cost this month and Average cost per run (no billing source),
 * Tokens this week, Top model this week.
 */
export const costStatCards: StatTile[] = buildRealTiles('cost', {
  'cost-this-month': { value: null },
  'cost-per-run': { value: null },
  'tokens-this-week': {
    value: weekTotal === null || weekTotal === 0 ? null : formatTokens(weekTotal),
    vars: { cache: weekTotal ? formatPercent((weekCacheRead ?? 0) / weekTotal * 100) : '', measured: measuredNote },
    trend: trendOf('tokensThisWeek'),
  },
  'top-model': {
    value: top && weekTotal ? modelName(top.model) : null,
    vars: { share: top && weekTotal ? formatPercent((top.total / weekTotal) * 100) : '' },
  },
})
