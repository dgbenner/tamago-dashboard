import { useState } from 'react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCount, formatPercent, NOT_MEASURED_MARK, type StatTile } from '@/data'

import { Sparkline } from './Sparkline'

/** The fewest points a trend needs before a line can be drawn. */
const TREND_MIN_POINTS = 2

/**
 * How to write one trend value in the sparkline tooltip. A tile carries its value already formatted
 * and no unit, so the unit is read from that text: a percent card shows percents, any other a count.
 */
function trendFormatter(tile: StatTile): (value: number) => string {
  return tile.value.trim().endsWith('%') ? formatPercent : formatCount
}

/** The card's title, with its `labelEmphasis` part (if any) in bold. */
function CardLabel({ tile }: { tile: StatTile }) {
  const at = tile.labelEmphasis ? tile.label.lastIndexOf(tile.labelEmphasis) : -1
  if (!tile.labelEmphasis || at < 0) return tile.label
  return (
    <>
      {tile.label.slice(0, at)}
      <span className="font-semibold text-foreground">{tile.labelEmphasis}</span>
      {tile.label.slice(at + tile.labelEmphasis.length)}
    </>
  )
}

/**
 * One stat card. A card with a `choice` gets a small menu at the bottom that switches it between its versions (for
 * example one per CEFR level); the first version shows on load.
 */
function StatCard({ tile: first }: { tile: StatTile }) {
  const [chosen, setChosen] = useState(first.choice?.options[0]?.value ?? '')
  const tile = first.choice?.options.find((option) => option.value === chosen)?.tile ?? first
  const trend = tile.trend !== null && tile.trend.length >= TREND_MIN_POINTS ? tile.trend : null

  return (
    // Three rows (text, sparkline, menu) shared with the other cards in the same row of the grid (subgrid), so every
    // sparkline starts at the same height however many lines the text above it takes (Dan, 2026-11-23).
    <Card id={`tile-${first.id}`} className="row-span-3 grid grid-rows-subgrid gap-4 py-4">
      <CardHeader className="content-start justify-items-center text-center">
        <CardDescription>
          <CardLabel tile={tile} />
        </CardDescription>
        {/* A card with no source shows a dash at the same size and weight as a number, read aloud as "Not measured yet". */}
        <CardTitle
          className={`max-w-full min-w-0 text-4xl font-semibold tabular-nums wrap-anywhere ${tile.measured ? '' : 'text-muted-foreground'}`}
          aria-label={tile.measured ? undefined : tile.value}
        >
          {tile.measured ? tile.value : NOT_MEASURED_MARK}
        </CardTitle>
        <p className="mx-auto w-[88%] text-xs text-muted-foreground italic">{tile.description}</p>
      </CardHeader>
      <CardContent>{trend ? <Sparkline label={tile.label} trend={trend} formatValue={trendFormatter(tile)} /> : null}</CardContent>
      {first.choice ? (
        <CardFooter className="justify-center gap-2">
          <span className="text-xs text-muted-foreground">{first.choice.label}</span>
          <Select value={chosen} onValueChange={setChosen}>
            <SelectTrigger size="sm" aria-label={first.choice.label} className="h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {first.choice.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.value}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardFooter>
      ) : (
        <div aria-hidden="true" />
      )}
    </Card>
  )
}

/**
 * The row of stat cards on every page: one column on a phone, two from `sm`, four from `xl`.
 * Values arrive already formatted, so they are shown as they are.
 *
 * - A card that is not measured shows a muted dash in the number's place, with "Not measured yet" as its accessible name.
 * - A card with a trend (2+ snapshots) gets a sparkline under its description.
 * - A card with no trend keeps an empty sparkline row, so the cards beside it still line up.
 */
export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <StatCard key={tile.id} tile={tile} />
      ))}
    </div>
  )
}
