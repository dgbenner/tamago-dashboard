import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  comingSoonLanguages,
  coverageListLabel,
  formatCount,
  formatDate,
  formatParts,
  formatPercent,
  languageColumnHelp,
  languageStatusKey,
  languagesWithContent,
  realLanguageStatusLabels,
  type LanguageColumnHelpKey,
  type RealLanguage,
} from '@/data'

import { EMPTY, cell, centredCell, head, numberCell, pinnedCell, pinnedRow } from './cells'
import { SortableHead, type HeadAlign } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'status' | 'parts' | 'circles' | 'words' | 'coverage' | 'lastDeploy'

interface Column {
  key: ColumnKey
  label: string
  /** The tooltip beside the heading; none when the column needs no explaining. */
  help?: LanguageColumnHelpKey
  /** false for a column that doesn't sort (Language). */
  sortable?: boolean
  align?: HeadAlign
}

const columns: Column[] = [
  { key: 'name', label: 'Language', sortable: false },
  { key: 'status', label: 'Status', align: 'center' },
  { key: 'parts', label: 'Parts', help: 'parts', align: 'right' },
  { key: 'circles', label: 'Circles', help: 'circles', align: 'right' },
  { key: 'words', label: 'Words', help: 'words', align: 'right' },
  { key: 'coverage', label: 'CEFR Coverage', help: 'coverage', align: 'right' },
  { key: 'lastDeploy', label: 'Last Deploy', help: 'lastDeploy' },
]

// What each column sorts by. A null (no value in the snapshot) sorts last either way.
const sortValues: Record<ColumnKey, (row: RealLanguage) => SortValue> = {
  name: (row) => row.name,
  status: (row) => realLanguageStatusLabels[languageStatusKey(row)],
  parts: (row) => row.partsLive,
  circles: (row) => row.circles,
  words: (row) => row.words,
  coverage: (row) => row.coverage?.percent ?? null,
  lastDeploy: (row) => row.lastDeploy?.number ?? null,
}

type StatusKey = ReturnType<typeof languageStatusKey>

// The label text carries the meaning; the variant only adds emphasis.
const statusVariants: Record<StatusKey, ComponentProps<typeof Badge>['variant']> = {
  complete: 'default',
  incomplete: 'secondary',
  started: 'outline',
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
    <TableRow id={`language-${row.id}`} className={cn(pinnedRow, comingSoon && 'text-muted-foreground')}>
      <TableCell className={cn(cell, pinnedCell, 'font-medium whitespace-nowrap')}>{row.name}</TableCell>
      <TableCell className={cn(cell, centredCell)}>
        <Badge
          variant={statusVariants[statusKey]}
          className={comingSoon ? 'text-muted-foreground' : undefined}
        >
          {realLanguageStatusLabels[statusKey]}
        </Badge>
      </TableCell>
      <TableCell className={numberCell}>
        {row.level ? (
          <>
            {row.level}
            <div className="text-xs text-muted-foreground">{formatParts(row)}</div>
          </>
        ) : (
          EMPTY
        )}
      </TableCell>
      <TableCell className={numberCell}>{count(row.circles)}</TableCell>
      <TableCell className={numberCell}>{count(row.words)}</TableCell>
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
      <TableCell className={cn(cell, 'whitespace-nowrap')}>
        {row.lastDeploy ? (
          <>
            {row.lastDeploy.name} <span className="tabular-nums">{row.lastDeploy.number}</span>
            <div className="text-xs text-muted-foreground">{formatDate(row.lastDeploy.date)}</div>
          </>
        ) : (
          EMPTY
        )}
      </TableCell>
    </TableRow>
  )
}

/** The courses themselves: status, size and coverage. Every language, coming soon last. */
export function LanguagesTable() {
  // Only the rows with content are sorted (in the app, and In Progress). The planned rows have no data
  // to sort by, so they are appended after them and stay at the bottom whatever the sort.
  const { sorted, toggleSort, directionOf } = useSort(languagesWithContent, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>
          Each course's status, size, CEFR coverage and latest deploy.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) =>
                column.sortable === false ? (
                  <TableHead key={column.key} className={cn(head, i === 0 && pinnedCell)}>
                    {column.label}
                  </TableHead>
                ) : (
                  <SortableHead
                    key={column.key}
                    label={column.label}
                    direction={directionOf(column.key)}
                    onSort={() => toggleSort(column.key)}
                    align={column.align}
                    help={column.help ? languageColumnHelp[column.help] : undefined}
                    className={i === 0 ? pinnedCell : undefined}
                  />
                ),
              )}
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
