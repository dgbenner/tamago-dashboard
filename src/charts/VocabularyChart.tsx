import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart'
import { cefrVocabulary, formatCount, vocabRows, type VocabRow } from '@/data'

import { TooltipRow } from './TooltipRow'

/** How strongly the far end of a range is drawn, against the solid part up to its lower figure. */
const RANGE_OPACITY = 0.35
/** Height per bar, in pixels. */
const ROW_HEIGHT = 34

// The research figures are grey; Tamago's own range is in Tamago green. Each has its own keys, so one chart holds both.
const config = {
  low: { label: 'Words', color: 'var(--chart-neutral)' },
  extra: { label: 'Words', color: 'var(--chart-neutral)' },
  tamagoLow: { label: 'Words', color: 'var(--tamago-green)' },
  tamagoExtra: { label: 'Words', color: 'var(--tamago-green)' },
} satisfies ChartConfig

// Each row fills only its own pair of keys, so a bar is drawn once: grey for research, green for Tamago.
const rows = vocabRows.map(({ low, extra, ...row }) =>
  row.tamago ? { ...row, tamagoLow: low, tamagoExtra: extra } : { ...row, low, extra },
)

/** One card: a few horizontal bars of word counts (research figures and Tamago's own range), then the facts. */
export function VocabularyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cefrVocabulary.title}</CardTitle>
        <CardDescription className="text-base font-medium text-foreground">{cefrVocabulary.headline}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ChartContainer
          config={config}
          role="group"
          aria-label={cefrVocabulary.headline}
          className="aspect-auto w-full"
          style={{ height: rows.length * ROW_HEIGHT + 40 }}
        >
          <BarChart data={rows} layout="vertical" accessibilityLayer margin={{ top: 0, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid horizontal={false} />
            <XAxis type="number" tickFormatter={formatCount} tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis type="category" dataKey="label" tickLine={false} axisLine={false} width={150} />
            <ChartTooltip
              cursor={false}
              content={({ active, payload }) => {
                const row = payload?.[0]?.payload as Omit<VocabRow, 'low' | 'extra'> | undefined
                if (!active || !row) return null
                return (
                  <ChartTooltipContent
                    active
                    payload={payload?.slice(0, 1)}
                    hideLabel
                    formatter={() => <TooltipRow color={payload?.[0]?.color} name={row.label} value={row.words} />}
                  />
                )
              }}
            />
            <Bar dataKey="low" stackId="words" fill="var(--color-low)" barSize={18} />
            <Bar dataKey="extra" stackId="words" fill="var(--color-extra)" fillOpacity={RANGE_OPACITY} radius={[0, 4, 4, 0]} barSize={18} />
            <Bar dataKey="tamagoLow" stackId="words" fill="var(--color-tamagoLow)" barSize={18} />
            <Bar dataKey="tamagoExtra" stackId="words" fill="var(--color-tamagoExtra)" fillOpacity={RANGE_OPACITY} radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ChartContainer>
        <ul className="flex list-disc flex-col gap-1 pl-5 text-sm">
          {cefrVocabulary.facts.map((fact) => (
            <li key={fact}>{fact}</li>
          ))}
        </ul>
        {cefrVocabulary.tamago ? <p className="text-sm font-medium">{cefrVocabulary.tamago}</p> : null}
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">{cefrVocabulary.caveat}</p>
      </CardFooter>
    </Card>
  )
}
