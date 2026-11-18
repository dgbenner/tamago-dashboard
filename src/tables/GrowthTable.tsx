import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { formatCount, formatDelta, growthRows, type GrowthRow } from '@/data'

import { SortableHead } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'addedThisWeek' | 'addedThisMonth' | 'totalLessons'

interface Column {
  key: ColumnKey
  label: string
  numeric?: boolean
}

const columns: Column[] = [
  { key: 'name', label: 'Language' },
  { key: 'addedThisWeek', label: 'Added this week', numeric: true },
  { key: 'addedThisMonth', label: 'Added this month', numeric: true },
  { key: 'totalLessons', label: 'Total lessons', numeric: true },
]

const sortValues: Record<ColumnKey, (row: GrowthRow) => SortValue> = {
  name: (row) => row.name,
  addedThisWeek: (row) => row.addedThisWeek,
  addedThisMonth: (row) => row.addedThisMonth,
  totalLessons: (row) => row.totalLessons,
}

const numberCell = 'text-right whitespace-nowrap tabular-nums'

export function GrowthTable() {
  const { sorted, toggleSort, directionOf } = useSort(growthRows, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Lessons by language</CardTitle>
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
                <TableCell className="font-medium whitespace-nowrap">{row.name}</TableCell>
                <TableCell className={numberCell}>{formatDelta(row.addedThisWeek)}</TableCell>
                <TableCell className={numberCell}>{formatDelta(row.addedThisMonth)}</TableCell>
                <TableCell className={numberCell}>{formatCount(row.totalLessons)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
