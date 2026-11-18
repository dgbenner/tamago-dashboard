import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { formatCount, formatShortDate, lessonsSeries, lessonsWeekly } from '@/data'

import { seriesConfig } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

const title = 'Lessons per language'
const span = `last ${lessonsWeekly.length} weeks`
const config = seriesConfig(lessonsSeries)
const names = new Map(lessonsSeries.map((series) => [series.id, series.name]))

/** Line chart: total lessons in each language at the end of each week. */
export function LessonsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Total lessons, weekly, {span}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${title}, ${span}`}
          className="aspect-auto h-72 w-full"
        >
          <LineChart
            data={lessonsWeekly}
            accessibilityLayer
            margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
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
              width={36}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = rowDate(payload)
                    return date ? `Week ending ${formatShortDate(date)}` : null
                  }}
                  formatter={(value, name, item) => (
                    <TooltipRow
                      color={item.color}
                      name={names.get(String(name)) ?? String(name)}
                      value={formatCount(Number(value))}
                    />
                  )}
                />
              }
            />
            <ChartLegend itemSorter={null} content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1.5" />} />
            {lessonsSeries.map((series) => (
              <Line
                key={series.id}
                dataKey={series.id}
                type="monotone"
                stroke={`var(--color-${series.id})`}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            ))}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
