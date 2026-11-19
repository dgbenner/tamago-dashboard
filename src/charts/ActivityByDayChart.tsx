import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { activityByDay, activitySeries, formatCount, formatShortDate, NOT_RECORDED } from '@/data'

import { seriesConfig } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

/** "Commits, pushes and deploys": the series names as one phrase, only the first keeping its capital. */
function seriesPhrase(names: string[]): string {
  const words = names.map((name, index) => (index === 0 ? name : name.toLowerCase()))
  if (words.length <= 1) return words.join('')
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`
}

const title = 'Activity per Day'
const span = `last ${activityByDay.length} days`
const description = `${seriesPhrase(activitySeries.map((series) => series.name))}, ${span}`
const config = seriesConfig(activitySeries)
const names = new Map(activitySeries.map((series) => [series.id, series.name]))

/**
 * Grouped bar chart: each day's commits, pushes and deploys side by side on one count axis. They
 * are three different counts, not parts of a whole, so they are not stacked. A day with no push
 * count draws no push bar, and its tooltip says so instead of showing a zero.
 */
export function ActivityByDayChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${title}: ${description}`}
          className="aspect-auto h-72 w-full"
        >
          <BarChart
            data={activityByDay}
            accessibilityLayer
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
            barGap={1}
            barCategoryGap="20%"
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatShortDate}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={24}
              interval="preserveStartEnd"
            />
            <YAxis
              tickFormatter={formatCount}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              width={28}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = rowDate(payload)
                    return date ? formatShortDate(date) : null
                  }}
                  formatter={(value, name, item) => (
                    <TooltipRow
                      color={item.color}
                      name={names.get(String(name)) ?? String(name)}
                      value={typeof value === 'number' ? formatCount(value) : NOT_RECORDED}
                    />
                  )}
                />
              }
            />
            <ChartLegend itemSorter={null} content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1.5" />} />
            {activitySeries.map((series) => (
              <Bar
                key={series.id}
                dataKey={series.id}
                fill={`var(--color-${series.id})`}
                radius={[4, 4, 0, 0]}
                isAnimationActive={false}
              />
            ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
