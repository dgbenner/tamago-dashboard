import type { ChartConfig } from '@/components/ui/chart'
import type { ChartSeries } from '@/data'

/**
 * The categorical color of the series at `index` in its fixed list: the first takes `--chart-1`,
 * the second `--chart-2`, and so on. The list order never changes, so a language or an agent keeps
 * its color on every chart.
 */
export function seriesColor(index: number): string {
  return `var(--chart-${index + 1})`
}

/** A `ChartConfig` for a list of series: each id gets its name as the label and its fixed color. */
export function seriesConfig(series: ChartSeries[]): ChartConfig {
  return Object.fromEntries(
    series.map(({ id, name }, index) => [id, { label: name, color: seriesColor(index) }]),
  )
}
