import { Bar, BarChart, BarStack, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { agentSeries, formatCount, formatShortDate, runsByDay } from '@/data'

import { seriesConfig } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

const title = 'Runs per day'
const span = `last ${runsByDay.length} days`
const config = seriesConfig(agentSeries)
const names = new Map(agentSeries.map((series) => [series.id, series.name]))

/** Stacked bar chart: each day's runs, split by agent. */
export function RunsByDayChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>By agent, {span}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${title} by agent, ${span}`}
          className="aspect-auto h-72 w-full"
        >
          <BarChart
            data={runsByDay}
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
                      value={formatCount(Number(value))}
                    />
                  )}
                />
              }
            />
            <ChartLegend itemSorter={null} content={<ChartLegendContent className="flex-wrap gap-x-4 gap-y-1.5" />} />
            {/* The radius belongs to the whole stack, so the top is rounded whichever agent is on top. */}
            <BarStack stackId="runs" radius={[4, 4, 0, 0]}>
              {agentSeries.map((series) => (
                <Bar
                  key={series.id}
                  dataKey={series.id}
                  fill={`var(--color-${series.id})`}
                  stroke="var(--card)"
                  strokeWidth={1}
                  isAnimationActive={false}
                />
              ))}
            </BarStack>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
