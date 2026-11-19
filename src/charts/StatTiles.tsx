import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
      {tiles.map((tile) => {
        const trend =
          tile.trend !== null && tile.trend.length >= TREND_MIN_POINTS ? tile.trend : null

        return (
          <Card key={tile.id}>
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
              <p className="mx-auto w-[65%] text-xs text-muted-foreground italic">{tile.description}</p>
            </CardHeader>
            {trend ? (
              <CardContent>
                <Sparkline label={tile.label} trend={trend} formatValue={trendFormatter(tile)} />
              </CardContent>
            ) : null}
          </Card>
        )
      })}
    </div>
  )
}
