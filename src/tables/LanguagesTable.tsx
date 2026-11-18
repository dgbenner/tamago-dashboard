import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import {
  formatCount,
  formatDate,
  formatPercent,
  languages,
  languageStatusLabels,
  type Language,
} from '@/data'

import { SortableHead } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey =
  | 'name'
  | 'status'
  | 'circles'
  | 'sentences'
  | 'a1Coverage'
  | 'draftsWaiting'
  | 'candidatesWaiting'
  | 'lastDeploy'

interface Column {
  key: ColumnKey
  label: string
  numeric?: boolean
}

const columns: Column[] = [
  { key: 'name', label: 'Language' },
  { key: 'status', label: 'Status' },
  { key: 'circles', label: 'Circles', numeric: true },
  { key: 'sentences', label: 'Sentences', numeric: true },
  { key: 'a1Coverage', label: 'A1 coverage', numeric: true },
  { key: 'draftsWaiting', label: 'Drafts waiting', numeric: true },
  { key: 'candidatesWaiting', label: 'Candidates waiting for Fable', numeric: true },
  { key: 'lastDeploy', label: 'Last deploy' },
]

// What each column sorts by. ISO dates ('YYYY-MM-DD') sort correctly as text.
const sortValues: Record<ColumnKey, (row: Language) => SortValue> = {
  name: (row) => row.name,
  status: (row) => languageStatusLabels[row.status],
  circles: (row) => row.circles,
  sentences: (row) => row.sentences,
  a1Coverage: (row) => row.a1Coverage,
  draftsWaiting: (row) => row.draftsWaiting,
  candidatesWaiting: (row) => row.candidatesWaiting,
  lastDeploy: (row) => row.lastDeploy.date,
}

const numberCell = 'text-right tabular-nums'

export function LanguagesTable() {
  const { sorted, toggleSort, directionOf } = useSort(languages, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Languages</CardTitle>
        <CardDescription>One row per language. Select a column heading to sort.</CardDescription>
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
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.name}</TableCell>
                <TableCell>
                  <Badge variant={row.status === 'complete' ? 'default' : 'secondary'}>
                    {languageStatusLabels[row.status]}
                  </Badge>
                </TableCell>
                <TableCell className={numberCell}>{formatCount(row.circles)}</TableCell>
                <TableCell className={numberCell}>{formatCount(row.sentences)}</TableCell>
                <TableCell className={numberCell}>{formatPercent(row.a1Coverage)}</TableCell>
                <TableCell className={numberCell}>{formatCount(row.draftsWaiting)}</TableCell>
                <TableCell className={numberCell}>{formatCount(row.candidatesWaiting)}</TableCell>
                <TableCell>
                  {row.lastDeploy.animal}{' '}
                  <span className="text-muted-foreground">{formatDate(row.lastDeploy.date)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
