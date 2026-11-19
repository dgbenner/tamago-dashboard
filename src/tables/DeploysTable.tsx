import type { ComponentProps } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  deployTestLabels,
  formatCount,
  formatDateTime,
  formatDeployTest,
  recentDeploys,
  type DeployTestResult,
  type RealDeploy,
} from '@/data'

import { EMPTY, wrappingText } from './cells'

// The label text carries the meaning; the variant only adds emphasis.
const testVariants: Record<DeployTestResult, ComponentProps<typeof Badge>['variant']> = {
  passed: 'secondary',
  failed: 'destructive',
  running: 'outline',
  'not-recorded': 'outline',
}

/** The changes shown in full; the rest are counted in a last line. */
const shownChanges = (deploy: RealDeploy) => deploy.changes.slice(0, 2)

function Changes({ deploy }: { deploy: RealDeploy }) {
  if (deploy.changes.length === 0) return <>{EMPTY}</>

  const shown = shownChanges(deploy)
  const more = deploy.changes.length - shown.length + deploy.changesHidden

  return (
    <div className={wrappingText}>
      {shown.map((change, i) => (
        <div key={i}>{change}</div>
      ))}
      {more > 0 && <div className="text-muted-foreground">and {formatCount(more)} more</div>}
    </div>
  )
}

export function DeploysTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Recent deploys</CardTitle>
        <CardDescription>
          The last {formatCount(recentDeploys.length)} deploys, newest first. A test result exists
          only for deploys made since the full test run was set up on GitHub.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>What was in it</TableHead>
              <TableHead>Test result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentDeploys.map((deploy) => {
              const counts = formatDeployTest(deploy)
              return (
                <TableRow key={deploy.number}>
                  <TableCell className="align-top whitespace-nowrap">
                    {deploy.name}{' '}
                    <span className="text-muted-foreground tabular-nums">{deploy.number}</span>
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    {formatDateTime(deploy.date)}
                  </TableCell>
                  <TableCell className="align-top">
                    <Changes deploy={deploy} />
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">
                    <Badge
                      variant={testVariants[deploy.test.result]}
                      className={
                        deploy.test.result === 'not-recorded' ? 'text-muted-foreground' : undefined
                      }
                    >
                      {deployTestLabels[deploy.test.result]}
                    </Badge>
                    {counts !== '' && <span className="ml-2 tabular-nums">{counts}</span>}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
