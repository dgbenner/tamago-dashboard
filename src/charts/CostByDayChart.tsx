import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { costByDay, formatCurrency, formatShortDate } from '@/data'

import { seriesColor } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

const title = 'Cost per Day'
const seriesName = 'Cost'
const span = `last ${costByDay.length} days`
const config = { cost: { label: seriesName, color: seriesColor(0) } } satisfies ChartConfig

/** Bar chart: what all agents together cost on each day. */
export function CostByDayChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>All agents, {span}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={config}
          role="group"
          aria-label={`${title}, ${span}`}
          className="aspect-auto h-64 w-full"
        >
          <BarChart
            data={costByDay}
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
            <YAxis tickFormatter={formatCurrency} tickLine={false} axisLine={false} width={56} />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  labelFormatter={(_, payload) => {
                    const date = rowDate(payload)
                    return date ? formatShortDate(date) : null
                  }}
                  formatter={(value, _name, item) => (
                    <TooltipRow
                      color={item.color}
                      name={seriesName}
                      value={formatCurrency(Number(value))}
                    />
                  )}
                />
              }
            />
            <Bar
              dataKey="cost"
              fill="var(--color-cost)"
              radius={[4, 4, 0, 0]}
              isAnimationActive={false}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
