import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cefrDistance, distanceCategories, distanceRows, formatCount, type DistanceRow } from '@/data'

import { TooltipRow } from './TooltipRow'

/** FSI categories run from easiest to hardest, so their colors run from green to orange. */
const CATEGORY_COLORS = ['var(--chart-6)', 'var(--chart-4)', 'var(--chart-2)']
/** How strongly the far end of a range (~600–750) is drawn, against the solid part up to its lower figure. */
const RANGE_OPACITY = 0.35
/** Height per language bar, in pixels. */
const ROW_HEIGHT = 30

const color = new Map(distanceCategories.map((category, i) => [category.id, CATEGORY_COLORS[i % CATEGORY_COLORS.length]]))
const config: ChartConfig = Object.fromEntries(
  distanceCategories.flatMap((category) => [
    [`${category.id}Low`, { label: category.name, color: color.get(category.id) }],
    [`${category.id}Extra`, { label: category.name, color: color.get(category.id) }],
  ]),
)
const categoryName = new Map(distanceCategories.map((category) => [category.id, category.name]))

/**
 * Horizontal bars: FSI class hours to professional working proficiency for each Tamago language, colored by FSI
 * category. A range is solid up to its lower figure and lighter to its upper one.
 */
export function DistanceChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cefrDistance.title}</CardTitle>
        <CardDescription>{cefrDistance.intro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <ul className="flex flex-wrap gap-2">
          {distanceCategories.map((category) => (
            <li key={category.id}>
              <Badge variant="outline" className="h-auto gap-1.5 whitespace-normal">
                <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color.get(category.id) }} />
                {category.name}
                <span className="font-normal text-muted-foreground">{category.hours}</span>
                {category.note ? <span className="font-normal text-muted-foreground italic">({category.note})</span> : null}
              </Badge>
            </li>
          ))}
        </ul>
        <ChartContainer
          config={config}
          role="group"
          aria-label={cefrDistance.axisLabel}
          className="aspect-auto w-full"
          style={{ height: distanceRows.length * ROW_HEIGHT + 40 }}
        >
          <BarChart data={distanceRows} layout="vertical" accessibilityLayer margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickFormatter={formatCount} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={88} />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as DistanceRow | undefined
                if (!active || !row) return null
                return (
                  <ChartTooltipContent
                    active
                    payload={payload?.slice(0, 1)}
                    hideLabel
                    formatter={() => (
                      <TooltipRow color={color.get(row.category)} name={`${row.name}, ${categoryName.get(row.category)}`} value={row.hours} />
                    )}
                  />
                )
              }}
            />
            {distanceCategories.flatMap((category) => [
              <Bar key={`${category.id}Low`} dataKey={`${category.id}Low`} stackId="hours" fill={`var(--color-${category.id}Low)`} barSize={18} />,
              <Bar
                key={`${category.id}Extra`}
                dataKey={`${category.id}Extra`}
                stackId="hours"
                fill={`var(--color-${category.id}Extra)`}
                fillOpacity={RANGE_OPACITY}
                radius={[0, 4, 4, 0]}
                barSize={18}
              />,
            ])}
          </BarChart>
        </ChartContainer>
        <p className="text-xs text-muted-foreground">{cefrDistance.axisLabel}</p>
      </CardContent>
      <CardFooter className="flex-col items-start gap-1">
        <p className="text-sm font-medium">{cefrDistance.caption}</p>
        <p className="text-xs text-muted-foreground">{cefrDistance.note}</p>
      </CardFooter>
    </Card>
  )
}
