import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Badge } from '@/components/ui/badge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, type ChartConfig } from '@/components/ui/chart'
import { cefrDistance, distanceCategories, distanceRows, formatHours, type DistanceRow } from '@/data'

/** FSI categories run from easiest to hardest, so their colors run from green to orange. */
const CATEGORY_COLORS = ['var(--chart-6)', 'var(--chart-4)', 'var(--chart-2)']
/** Room on the right for the value written after each bar, in pixels. */
const LABEL_ROOM = 64
/** Height per language bar, in pixels. */
const ROW_HEIGHT = 30

const color = new Map(distanceCategories.map((category, i) => [category.id, CATEGORY_COLORS[i % CATEGORY_COLORS.length]]))
const config: ChartConfig = Object.fromEntries(
  distanceCategories.map((category) => [category.id, { label: category.name, color: color.get(category.id) }]),
)

/** The three FSI categories as chips: color, name and hours. */
function CategoryChips({ className = '' }: { className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`}>
      {distanceCategories.map((category) => (
        <li key={category.id}>
          <Badge variant="outline" className="h-auto gap-1.5 whitespace-normal">
            <span aria-hidden="true" className="size-2 shrink-0 rounded-full" style={{ backgroundColor: color.get(category.id) }} />
            {category.name}
            <span className="font-normal text-muted-foreground">{category.hours}</span>
          </Badge>
        </li>
      ))}
    </ul>
  )
}

/**
 * Horizontal bars: the hours each Tamago language takes to reach working fluency, colored by FSI category, with the
 * value written after each bar. No hover: everything is on the page.
 */
export function DistanceChart() {
  return (
    <Card>
      {/* One column until the chips move up into the corner (the header splits in two whenever it has an action). */}
      <CardHeader className="gap-1 max-lg:has-data-[slot=card-action]:grid-cols-1">
        <CardTitle>{cefrDistance.title}</CardTitle>
        <CardDescription>{cefrDistance.intro}</CardDescription>
        {/* On a wide screen the chips sit in the header's top-right corner; narrower, they drop under it. */}
        <CardAction className="hidden lg:block">
          <CategoryChips className="justify-end" />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <CategoryChips className="lg:hidden" />
        <ChartContainer
          config={config}
          role="group"
          aria-label={cefrDistance.title}
          className="aspect-auto w-full"
          style={{ height: distanceRows.length * ROW_HEIGHT + 40 }}
        >
          <BarChart data={distanceRows} layout="vertical" margin={{ top: 0, right: LABEL_ROOM, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickFormatter={formatHours} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={88} />
            {distanceCategories.map((category) => (
              <Bar
                key={category.id}
                dataKey={category.id}
                stackId="hours"
                fill={`var(--color-${category.id})`}
                radius={[0, 4, 4, 0]}
                barSize={18}
                isAnimationActive={false}
                label={{
                  position: 'right',
                  offset: 8,
                  className: 'fill-muted-foreground text-xs',
                  // Each row's own text ("~680 h"), on the bar of the row's category only.
                  valueAccessor: (entry: { payload: DistanceRow }) => (entry.payload.category === category.id ? entry.payload.hours : ''),
                }}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
