import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatMs, formatShortDate, responseTimes } from '@/data'

import { seriesColor } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

const title = 'Response time'
const span = `last ${responseTimes.length} days`
const config = { ms: { label: title, color: seriesColor(0) } } satisfies ChartConfig

/** Line chart: the site's response time on each day. */
export function ResponseTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Daily, {span}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${title}, ${span}`}
          className="aspect-auto h-64 w-full"
        >
          <LineChart
            data={responseTimes}
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
            <YAxis tickFormatter={formatMs} tickLine={false} axisLine={false} width={52} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = rowDate(payload)
                    return date ? formatShortDate(date) : null
                  }}
                  formatter={(value, _name, item) => (
                    <TooltipRow color={item.color} name={title} value={formatMs(Number(value))} />
                  )}
                />
              }
            />
            <Line
              dataKey="ms"
              type="monotone"
              stroke="var(--color-ms)"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
