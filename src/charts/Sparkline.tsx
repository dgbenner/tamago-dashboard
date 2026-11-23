import { useId } from 'react'
import { Area, AreaChart, XAxis, YAxis } from 'recharts'

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatDateTime, type TrendPoint } from '@/data'

/** The Y range given to a trend that sits flat at zero, so the chart's tick maths has a range to work with. */
const FLAT_ZERO_PAD = 1

/** The lowest and highest value of a trend. */
function extent(trend: TrendPoint[]): [number, number] {
  const values = trend.map((point) => point.value)
  return [Math.min(...values), Math.max(...values)]
}

/**
 * The hidden Y domain, from zero (Dan, 2026-11-23): every sparkline shares the same baseline, so a line's height
 * shows the value itself, not only how it moved. A trend that is zero throughout gets a range of one, which keeps
 * its line on the baseline.
 */
function yDomain(trend: TrendPoint[]): [number, number] {
  const [min, max] = extent(trend)
  return [Math.min(0, min), max > 0 ? max : FLAT_ZERO_PAD]
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
 * The sparkline under a stat card: one line over the snapshots a trend holds, no axes, coloured with the same
 * yellow-to-green gradient as the "Real data" strip at the top of the page. The
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
  const config = { value: { label, color: 'var(--tamago-green)' } } satisfies ChartConfig
  // The gradient is measured across the whole chart (userSpaceOnUse), so a flat line still gets it: a gradient sized
  // to the line's own box has no height for a flat line and would draw nothing.
  const gradientId = `sparkline-${useId().replace(/:/g, '')}`

  return (
    <ChartContainer
      config={config}
      role="group"
      aria-label={`${label}, trend over ${trend.length} snapshots`}
      className="aspect-auto h-12 w-full"
    >
      <AreaChart data={trend} accessibilityLayer margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
        <defs>
          <linearGradient id={gradientId} gradientUnits="userSpaceOnUse" x1="0%" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor="var(--tamago-yellow)" />
            <stop offset="100%" stopColor="var(--tamago-green)" />
          </linearGradient>
        </defs>
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
          stroke={`url(#${gradientId})`}
          strokeWidth={2}
          fill="none"
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  )
}
