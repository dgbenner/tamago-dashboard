import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { deployResultLabels, deploys, formatChecks, formatCount, formatDate } from '@/data'

export function DeploysTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Recent deploys</CardTitle>
        <CardDescription>The last {formatCount(deploys.length)} deploys, newest first.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Animal name</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Branch</TableHead>
              <TableHead className="text-right">Checks passed</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deploys.map((deploy) => (
              <TableRow key={deploy.id}>
                <TableCell className="font-medium">{deploy.animal}</TableCell>
                <TableCell>{formatDate(deploy.date)}</TableCell>
                <TableCell className="font-mono text-xs">{deploy.branch}</TableCell>
                <TableCell className="text-right tabular-nums">{formatChecks(deploy)}</TableCell>
                <TableCell>
                  <Badge variant={deploy.result === 'blocked' ? 'destructive' : 'secondary'}>
                    {deployResultLabels[deploy.result]}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
