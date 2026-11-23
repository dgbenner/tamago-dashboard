import { useState } from 'react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatCount, formatPercent, type StatTile } from '@/data'

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

/**
 * One stat card. A card with a `choice` gets a small menu at the bottom that switches it between its versions (for
 * example one per CEFR level); the first version shows on load.
 */
function StatCard({ tile: first }: { tile: StatTile }) {
  const [chosen, setChosen] = useState(first.choice?.options[0]?.value ?? '')
  const tile = first.choice?.options.find((option) => option.value === chosen)?.tile ?? first
  const trend = tile.trend !== null && tile.trend.length >= TREND_MIN_POINTS ? tile.trend : null

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="justify-items-center text-center">
        <CardDescription>{tile.label}</CardDescription>
        {tile.measured ? (
          <CardTitle className="max-w-full min-w-0 text-4xl font-semibold tabular-nums wrap-anywhere">
            {tile.value}
          </CardTitle>
        ) : (
          <CardTitle className="max-w-full min-w-0 py-1.5 text-[1.2rem] font-medium text-muted-foreground wrap-anywhere">
            {tile.value}
          </CardTitle>
        )}
        <p className="mx-auto w-[88%] text-xs text-muted-foreground italic">{tile.description}</p>
      </CardHeader>
      {trend ? (
        <CardContent>
          <Sparkline label={tile.label} trend={trend} formatValue={trendFormatter(tile)} />
        </CardContent>
      ) : null}
      {first.choice ? (
        <CardFooter className="mt-auto justify-center gap-2">
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
      ) : null}
    </Card>
  )
}

/**
 * The row of stat cards on every page: one column on a phone, two from `sm`, four from `xl`.
 * Values arrive already formatted, so they are shown as they are.
 *
 * - A card that is not measured shows its "Not measured yet" label small and muted, not as a number.
 * - A card with a trend (2+ snapshots) gets a sparkline under its description.
 * - A card with no trend simply ends after the description: no chart, no reserved space.
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
