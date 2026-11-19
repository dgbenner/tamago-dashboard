import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  formatDateTime,
  healthCheckResultLabels,
  healthChecks,
  type HealthCheckResult,
} from '@/data'

import { EMPTY, wrappingText } from './cells'

// The label text carries the meaning; the variant only adds emphasis.
const resultVariants: Record<HealthCheckResult, ComponentProps<typeof Badge>['variant']> = {
  pass: 'secondary',
  fail: 'destructive',
  'not-measured': 'outline',
}

export function HealthChecksTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Checks</CardTitle>
        <CardDescription>
          Each check, when it last ran and how it ended, or why there is no measurement yet.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Check</TableHead>
              <TableHead>Last run</TableHead>
              <TableHead>Result</TableHead>
              <TableHead>Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {healthChecks.map((check) => (
              <TableRow key={check.id}>
                <TableCell className="align-top font-medium whitespace-nowrap">{check.name}</TableCell>
                <TableCell className="align-top whitespace-nowrap">
                  {check.lastRun === null ? EMPTY : formatDateTime(check.lastRun)}
                </TableCell>
                <TableCell className="align-top">
                  <Badge
                    variant={resultVariants[check.result]}
                    className={check.result === 'not-measured' ? 'text-muted-foreground' : undefined}
                  >
                    {healthCheckResultLabels[check.result]}
                  </Badge>
                </TableCell>
                <TableCell className="align-top text-muted-foreground">
                  <div className={wrappingText}>{check.detail}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
