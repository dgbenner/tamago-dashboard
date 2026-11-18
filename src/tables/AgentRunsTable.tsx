import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  agentRuns,
  formatCount,
  formatDateTime,
  formatDuration,
  runResultLabels,
  type RunResult,
} from '@/data'

// Done is quiet, Flagged is outlined so it stands apart, Stopped is the alarm. The label text
// carries the meaning; the variant only adds emphasis.
const resultVariants: Record<RunResult, ComponentProps<typeof Badge>['variant']> = {
  done: 'secondary',
  flagged: 'outline',
  stopped: 'destructive',
}

export function AgentRunsTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Recent runs</CardTitle>
        <CardDescription>The last {formatCount(agentRuns.length)} runs, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Agent</TableHead>
              <TableHead>Task</TableHead>
              <TableHead>Result</TableHead>
              <TableHead className="text-right">Duration</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {agentRuns.map((run) => (
              <TableRow key={run.id}>
                <TableCell className="whitespace-nowrap">{formatDateTime(run.startedAt)}</TableCell>
                <TableCell className="font-medium whitespace-nowrap">{run.agentName}</TableCell>
                <TableCell className="whitespace-nowrap">{run.task}</TableCell>
                <TableCell>
                  <Badge variant={resultVariants[run.result]}>{runResultLabels[run.result]}</Badge>
                </TableCell>
                <TableCell className="text-right whitespace-nowrap tabular-nums">
                  {formatDuration(run.durationSeconds)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
