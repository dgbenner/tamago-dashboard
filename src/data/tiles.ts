// Builds a page's four stat cards: the text comes from labels.json, the values from code.

import labelsJson from './labels.json'
import { check } from './internal'
import type { StatTile } from './types'

type TilePage = keyof typeof labelsJson.statTiles

/** Pair each card's label and description (labels.json, in page order) with its formatted value. */
export function buildTiles(page: TilePage, values: Record<string, string>): StatTile[] {
  const texts: Omit<StatTile, 'value'>[] = labelsJson.statTiles[page]
  check(texts.length === Object.keys(values).length, `${page} stat cards and their values don't match`)
  return texts.map((text) => {
    const value = values[text.id]
    check(value !== undefined, `no value for the ${page} stat card "${text.id}"`)
    return { ...text, value }
  })
}
