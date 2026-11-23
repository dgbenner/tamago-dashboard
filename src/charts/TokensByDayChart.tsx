import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { formatShortDate, formatTokens, tokenSeries, tokensByDay } from '@/data'

import { seriesConfig } from './seriesColor'
import { rowDate, TooltipRow } from './TooltipRow'

const title = 'Tokens per Day'
const config = seriesConfig(tokenSeries)
const names = new Map(tokenSeries.map((series) => [series.id, series.name]))

/** Stacked bars: Claude Code tokens in Tamago sessions per day, by model, over the snapshot's 14 days. */
export function TokensByDayChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Claude Code sessions working on Tamago, by model</CardDescription>
      </CardHeader>
      <CardContent>
        {tokensByDay.length === 0 ? (
          <p className="text-sm text-muted-foreground">Not measured yet</p>
        ) : (
          <ChartContainer config={config} role="group" aria-label={`${title}, ${tokensByDay.length} days`} className="aspect-auto h-72 w-full">
            <BarChart data={tokensByDay} accessibilityLayer margin={{ top: 8, right: 12, bottom: 0, left: 0 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="date" tickFormatter={formatShortDate} tickLine={false} axisLine={false} tickMargin={8} minTickGap={16} />
              <YAxis tickFormatter={formatTokens} tickLine={false} axisLine={false} width={60} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      const date = rowDate(payload)
                      return date ? formatShortDate(date) : null
                    }}
                    formatter={(value, name, item) => (
                      <TooltipRow color={item.color} name={names.get(String(name)) ?? String(name)} value={formatTokens(Number(value))} />
                    )}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              {tokenSeries.map((series) => (
                <Bar key={series.id} dataKey={series.id} stackId="tokens" fill={`var(--color-${series.id})`} />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
