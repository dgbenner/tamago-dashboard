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

import { SortableHead } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'runs' | 'tokens' | 'cost' | 'averageCostPerRun'

interface Column {
  key: ColumnKey
  label: string
  numeric?: boolean
}

const columns: Column[] = [
  { key: 'name', label: 'Agent' },
  { key: 'runs', label: 'Runs', numeric: true },
  { key: 'tokens', label: 'Tokens', numeric: true },
  { key: 'cost', label: 'Cost', numeric: true },
  { key: 'averageCostPerRun', label: 'Average cost per run', numeric: true },
]

const sortValues: Record<ColumnKey, (row: AgentCostRow) => SortValue> = {
  name: (row) => row.name,
  runs: (row) => row.runs,
  tokens: (row) => row.tokens,
  cost: (row) => row.cost,
  averageCostPerRun: (row) => row.averageCostPerRun,
}

const numberCell = 'text-right whitespace-nowrap tabular-nums'

export function AgentCostTable() {
  const { sorted, toggleSort, directionOf } = useSort(agentCostRows, sortValues)
  const totals = costTotalsThisMonth()

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Cost by agent</CardTitle>
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
              <TableCell className="whitespace-nowrap">All agents</TableCell>
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
