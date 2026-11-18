import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { StatTile } from '@/data'

/**
 * A row of stat cards without sparklines, for the Growth, Health, Agent activity and Cost pages.
 * Same grid and same type as `StatCards`: one column on a phone, two from `sm`, four from `xl`.
 * Values arrive already formatted, so they are shown as they are.
 */
export function StatTiles({ tiles }: { tiles: StatTile[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {tiles.map((tile) => (
        <Card key={tile.id}>
          <CardHeader>
            <CardDescription>{tile.label}</CardDescription>
            <CardTitle className="min-w-0 text-3xl font-semibold tabular-nums wrap-anywhere">
              {tile.value}
            </CardTitle>
            <p className="text-xs text-muted-foreground">{tile.description}</p>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
