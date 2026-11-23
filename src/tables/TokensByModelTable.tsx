import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatTokens, tokenRows, tokenTableText } from '@/data'
import { cn } from '@/lib/utils'

import { cell, head, numberCell, pinnedCell, pinnedRow } from './cells'

const COLUMNS = [
  { key: 'output', label: 'Output' },
  { key: 'input', label: 'Fresh Input' },
  { key: 'cacheWrite', label: 'Cache Writes' },
  { key: 'cacheRead', label: 'Cache Reads' },
  { key: 'total', label: 'Total' },
] as const

/** One row per model: this week's tokens by kind, busiest model first. */
export function TokensByModelTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Tokens by Model</CardTitle>
        <CardDescription>
          {tokenTableText.description}
          {tokenTableText.scope ? ` ${tokenTableText.scope}` : null}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table className="w-auto">
          <TableHeader>
            <TableRow>
              <TableHead className={cn(head, pinnedCell)}>Model</TableHead>
              {COLUMNS.map((column) => (
                <TableHead key={column.key} className={cn(head, 'text-right')}>
                  {column.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokenRows.map((row) => (
              <TableRow key={row.id} className={pinnedRow}>
                <TableCell className={cn(cell, pinnedCell, 'font-medium whitespace-nowrap')}>{row.name}</TableCell>
                {COLUMNS.map((column) => (
                  <TableCell key={column.key} className={cn(numberCell, column.key === 'total' && 'font-medium')}>
                    {formatTokens(row[column.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
