// Builds a page's four stat cards: the text comes from labels.json, the values from code.

import labelsJson from './labels.json'
import { check, fill } from './internal'
import type { StatTile, TrendPoint } from './types'

type TilePage = keyof typeof labelsJson.statTiles
type TileText = { id: string; label: string; description: string }

/**
 * The placeholder (mock) pages, Growth and Cost: pair each card's label and description (labels.json,
 * in page order) with its formatted value. Mock cards are always "measured" and have no trend.
 */
export function buildTiles(page: TilePage, values: Record<string, string>): StatTile[] {
  const texts: TileText[] = labelsJson.statTiles[page]
  check(texts.length === Object.keys(values).length, `${page} stat cards and their values don't match`)
  return texts.map((text) => {
    const value = values[text.id]
    check(value !== undefined, `no value for the ${page} stat card "${text.id}"`)
    return { ...text, value, measured: true, trend: null }
  })
}

/** One real card's value. `value: null` means there is no real source. */
export interface RealTileValue {
  /** The formatted value, or null when the snapshot has no source for it. */
  value: string | null
  /** Values for the `{name}` slots of the card's description in labels.json. */
  vars?: Record<string, string>
  /** The trend from the snapshot history, or null. Ignored when there is no value. */
  trend?: TrendPoint[] | null
}

/**
 * The real pages (Content Health, Content Growth, System Health, Agent Activity). A card with no source gets the
 * "Not measured yet" label as its value, `measured: false` and no trend.
 */
export function buildRealTiles(page: TilePage, values: Record<string, RealTileValue>): StatTile[] {
  const texts: TileText[] = labelsJson.statTiles[page]
  check(texts.length === Object.keys(values).length, `${page} stat cards and their values don't match`)
  return texts.map((text) => {
    const entry = values[text.id]
    check(entry !== undefined, `no value for the ${page} stat card "${text.id}"`)
    const measured = entry.value !== null
    return {
      id: text.id,
      label: text.label,
      value: entry.value ?? labelsJson.notMeasured,
      description: fill(text.description, entry.vars),
      measured,
      trend: measured ? (entry.trend ?? null) : null,
    }
  })
}
