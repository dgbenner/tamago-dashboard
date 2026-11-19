import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  agentCostRows,
  averageCostPerRun,
  costTotalsThisMonth,
  formatCount,
  formatCurrency,
  formatTokens,
  type AgentCostRow,
} from '@/data'

import { cn } from '@/lib/utils'

import { cell, numberCell } from './cells'
import { SortableHead } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'runs' | 'tokens' | 'cost' | 'averageCostPerRun'

interface Column {
  key: ColumnKey
  label: string
  align?: 'right'
}

const columns: Column[] = [
  { key: 'name', label: 'Agent' },
  { key: 'runs', label: 'Runs', align: 'right' },
  { key: 'tokens', label: 'Tokens', align: 'right' },
  { key: 'cost', label: 'Cost', align: 'right' },
  { key: 'averageCostPerRun', label: 'Average Cost per Run', align: 'right' },
]

const sortValues: Record<ColumnKey, (row: AgentCostRow) => SortValue> = {
  name: (row) => row.name,
  runs: (row) => row.runs,
  tokens: (row) => row.tokens,
  cost: (row) => row.cost,
  averageCostPerRun: (row) => row.averageCostPerRun,
}

export function AgentCostTable() {
  const { sorted, toggleSort, directionOf } = useSort(agentCostRows, sortValues)
  const totals = costTotalsThisMonth()

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Cost by Agent</CardTitle>
        <CardDescription>
          This month so far, one row per agent. Select a column heading to sort.
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
                  label={column.label}
                  align={column.align}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id}>
                <TableCell className={cn(cell, 'font-medium whitespace-nowrap')}>{row.name}</TableCell>
                <TableCell className={numberCell}>{formatCount(row.runs)}</TableCell>
                <TableCell className={numberCell}>{formatTokens(row.tokens)}</TableCell>
                <TableCell className={numberCell}>{formatCurrency(row.cost)}</TableCell>
                <TableCell className={numberCell}>{formatCurrency(row.averageCostPerRun)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          {/* The total is outside the sorted body, so it stays last whatever the sort. */}
          <TableFooter>
            <TableRow>
              <TableCell className={cn(cell, 'whitespace-nowrap')}>All Agents</TableCell>
              <TableCell className={numberCell}>{formatCount(totals.runs)}</TableCell>
              <TableCell className={numberCell}>{formatTokens(totals.tokens)}</TableCell>
              <TableCell className={numberCell}>{formatCurrency(totals.cost)}</TableCell>
              <TableCell className={numberCell}>{formatCurrency(averageCostPerRun(totals))}</TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  )
}
