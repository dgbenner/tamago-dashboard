import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, type TrendPoint } from '@/data'

/** Half the Y range given to a trend that sits flat at zero. */
const FLAT_ZERO_PAD = 1

/** The lowest and highest value of a trend. */
function extent(trend: TrendPoint[]): [number, number] {
  const values = trend.map((point) => point.value)
  return [Math.min(...values), Math.max(...values)]
}

/**
 * The hidden Y domain. It hugs the trend's own range so small movements still show. A trend that
 * never moves has no range, so it gets one made from its own value, which puts the line mid-height.
 */
function yDomain(trend: TrendPoint[]): [number, number] {
  const [min, max] = extent(trend)
  if (min < max) return [min, max]
  // A flat line at zero gets a range of one either side: a vanishingly small range breaks the chart's tick maths.
  const pad = Math.abs(min) || FLAT_ZERO_PAD
  return [min - pad, max + pad]
}

/**
 * Whole-number counts that move by a few steps (languages live, tests passed) read better as steps
 * than as slopes. A trend qualifies when its whole range is smaller than its number of points.
 */
function movesInSteps(trend: TrendPoint[]): boolean {
  const [min, max] = extent(trend)
  return trend.every((point) => Number.isInteger(point.value)) && max - min < trend.length
}

/**
 * The sparkline under a stat card: one grey line over the snapshots a trend holds, no axes. The
 * tooltip gives the snapshot's date and time and its value. Only drawn for a trend of 2+ points;
 * the caller leaves it out entirely when there is no trend.
 */
export function Sparkline({
  label,
  trend,
  formatValue,
}: {
  /** The stat's name, for the tooltip row and the accessible name. */
  label: string
  trend: TrendPoint[]
  /** How to write one trend value in the tooltip. */
  formatValue: (value: number) => string
}) {
  const config = { value: { label, color: 'var(--chart-neutral)' } } satisfies ChartConfig

  return (
    <ChartContainer
      config={config}
      role="group"
      aria-label={`${label}, trend over ${trend.length} snapshots`}
      className="aspect-auto h-12 w-full"
    >
      <AreaChart data={trend} accessibilityLayer margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <XAxis dataKey="takenAt" hide />
        <YAxis hide domain={yDomain(trend)} />
        <ChartTooltip
          content={
            <ChartTooltipContent
              labelFormatter={(_, payload) => {
                const point = payload?.[0]?.payload as TrendPoint | undefined
                return point ? formatDateTime(point.takenAt) : null
              }}
              formatter={(value) => (
                <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium text-foreground tabular-nums">
                    {formatValue(Number(value))}
                  </span>
                </div>
              )}
            />
          }
        />
        <Area
          dataKey="value"
          type={movesInSteps(trend) ? 'step' : 'monotone'}
          stroke="var(--color-value)"
          strokeWidth={2}
          fill="var(--color-value)"
          fillOpacity={0.12}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
