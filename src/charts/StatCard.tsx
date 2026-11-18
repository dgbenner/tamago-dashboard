import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatShortDate, formatStatValue, statDescriptions, type Stat, type StatPoint } from '@/data'

/** The lowest and highest value of a series. */
function extent(series: StatPoint[]): [number, number] {
  const values = series.map((point) => point.value)
  return [Math.min(...values), Math.max(...values)]
}

/**
 * The hidden Y domain. It hugs the series' own range so small movements still show. A series that
 * never moves has no range, so it gets one made from its own value, which puts the line mid-height.
 */
function yDomain(series: StatPoint[]): [number, number] {
  const [min, max] = extent(series)
  if (min < max) return [min, max]
  const pad = Math.abs(min) || Number.MIN_VALUE
  return [min - pad, max + pad]
}

/**
 * Counts that move by a few whole steps (languages live, failed checks) read better as steps than
 * as slopes. A count qualifies when its whole range is smaller than its number of points.
 */
function movesInSteps(stat: Stat): boolean {
  const [min, max] = extent(stat.series)
  return stat.unit === 'count' && max - min < stat.series.length
}

export function StatCard({ stat }: { stat: Stat }) {
  const config = {
    value: { label: stat.label, color: 'var(--chart-neutral)' },
  } satisfies ChartConfig

  return (
    <Card>
      <CardHeader>
        <CardDescription>{stat.label}</CardDescription>
        <CardTitle className="text-3xl font-semibold tabular-nums">{formatStatValue(stat)}</CardTitle>
        <p className="text-xs text-muted-foreground">{statDescriptions[stat.id]}</p>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${stat.label}, last ${stat.series.length} days`}
          className="aspect-auto h-12 w-full"
        >
          <AreaChart
            data={stat.series}
            accessibilityLayer
            margin={{ top: 4, right: 2, bottom: 4, left: 2 }}
          >
            <XAxis dataKey="date" hide />
            <YAxis hide domain={yDomain(stat.series)} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const point = payload?.[0]?.payload as StatPoint | undefined
                    return point ? formatShortDate(point.date) : null
                  }}
                  formatter={(value) => (
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">{stat.label}</span>
                      <span className="font-medium text-foreground tabular-nums">
                        {formatStatValue(stat, Number(value))}
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Area
              dataKey="value"
              type={movesInSteps(stat) ? 'step' : 'monotone'}
              stroke="var(--color-value)"
              strokeWidth={2}
              fill="var(--color-value)"
              fillOpacity={0.12}
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
