import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import {
  comingSoonLanguages,
  coverageListLabel,
  formatCount,
  formatDate,
  formatParts,
  formatPercent,
  languageStatusKey,
  liveLanguages,
  realLanguageStatusLabels,
  type RealLanguage,
} from '@/data'

import { EMPTY, numberCell } from './cells'
import { SortableHead } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey =
  | 'name'
  | 'status'
  | 'parts'
  | 'circles'
  | 'sentences'
  | 'sentencesTatoeba'
  | 'sentencesDrafted'
  | 'coverage'
  | 'draftsWaiting'
  | 'lastDeploy'

interface Column {
  key: ColumnKey
  label: string
  numeric?: boolean
}

const columns: Column[] = [
  { key: 'name', label: 'Language' },
  { key: 'status', label: 'Status' },
  { key: 'parts', label: 'Parts', numeric: true },
  { key: 'circles', label: 'Circles', numeric: true },
  { key: 'sentences', label: 'Sentences', numeric: true },
  { key: 'sentencesTatoeba', label: 'From Tatoeba', numeric: true },
  { key: 'sentencesDrafted', label: 'Drafted', numeric: true },
  { key: 'coverage', label: 'A1 coverage', numeric: true },
  { key: 'draftsWaiting', label: 'Awaiting native check', numeric: true },
  { key: 'lastDeploy', label: 'Last deploy' },
]

// What each column sorts by. A null (no value in the snapshot) sorts last either way.
const sortValues: Record<ColumnKey, (row: RealLanguage) => SortValue> = {
  name: (row) => row.name,
  status: (row) => realLanguageStatusLabels[languageStatusKey(row)],
  parts: (row) => row.partsLive,
  circles: (row) => row.circles,
  sentences: (row) => row.sentences,
  sentencesTatoeba: (row) => row.sentencesTatoeba,
  sentencesDrafted: (row) => row.sentencesDrafted,
  coverage: (row) => row.coverage?.percent ?? null,
  draftsWaiting: (row) => row.draftsWaiting,
  lastDeploy: (row) => row.lastDeploy?.number ?? null,
}

type StatusKey = ReturnType<typeof languageStatusKey>

// The label text carries the meaning; the variant only adds emphasis.
const statusVariants: Record<StatusKey, ComponentProps<typeof Badge>['variant']> = {
  complete: 'default',
  'in-progress': 'secondary',
  'coming-soon': 'outline',
}

/** A count, or the em dash when the snapshot has no value. */
function count(value: number | null): string {
  return value === null ? EMPTY : formatCount(value)
}

function LanguageRow({ row }: { row: RealLanguage }) {
  const statusKey = languageStatusKey(row)
  const comingSoon = statusKey === 'coming-soon'

  return (
    <TableRow className={comingSoon ? 'text-muted-foreground' : undefined}>
      <TableCell className="font-medium whitespace-nowrap">{row.name}</TableCell>
      <TableCell>
        <Badge
          variant={statusVariants[statusKey]}
          className={comingSoon ? 'text-muted-foreground' : undefined}
        >
          {realLanguageStatusLabels[statusKey]}
        </Badge>
      </TableCell>
      <TableCell className={numberCell}>{formatParts(row) || EMPTY}</TableCell>
      <TableCell className={numberCell}>{count(row.circles)}</TableCell>
      <TableCell className={numberCell}>{count(row.sentences)}</TableCell>
      <TableCell className={numberCell}>{count(row.sentencesTatoeba)}</TableCell>
      <TableCell className={numberCell}>{count(row.sentencesDrafted)}</TableCell>
      <TableCell className={numberCell}>
        {row.coverage ? (
          <>
            {formatPercent(row.coverage.percent)}
            <div className="text-xs text-muted-foreground">{coverageListLabel(row.coverage)}</div>
          </>
        ) : (
          EMPTY
        )}
      </TableCell>
      <TableCell className={numberCell}>{count(row.draftsWaiting)}</TableCell>
      <TableCell className="whitespace-nowrap">
        {row.lastDeploy ? (
          <>
            {row.lastDeploy.name} <span className="tabular-nums">{row.lastDeploy.number}</span>{' '}
            <span className="text-muted-foreground">{formatDate(row.lastDeploy.date)}</span>
          </>
        ) : (
          EMPTY
        )}
      </TableCell>
    </TableRow>
  )
}

export function LanguagesTable() {
  // Only the live rows are sorted. The coming-soon rows have no data to sort by, so they are
  // appended after them and stay at the bottom whatever the sort.
  const { sorted, toggleSort, directionOf } = useSort(liveLanguages, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          One row per language: {formatCount(liveLanguages.length)} live,{' '}
          {formatCount(comingSoonLanguages.length)} coming soon. Select a column heading to sort the
          live languages. Awaiting native check: drafted sentences that are live in lessons but not yet
          checked by a native speaker.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <SortableHead
                  key={column.key}
                  direction={directionOf(column.key)}
                  onSort={() => toggleSort(column.key)}
                  numeric={column.numeric}
                >
                  {column.label}
                </SortableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <LanguageRow key={row.id} row={row} />
            ))}
            {comingSoonLanguages.map((row) => (
              <LanguageRow key={row.id} row={row} />
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
