import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { auditResultLabels, audits, formatDateTime } from '@/data'

export function AuditsTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Audits</CardTitle>
        <CardDescription>Each audit, when it last ran and how it ended.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Audit</TableHead>
              <TableHead>Last run</TableHead>
              <TableHead>Result</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {audits.map((audit) => (
              <TableRow key={audit.id}>
                <TableCell className="font-medium whitespace-nowrap">{audit.name}</TableCell>
                <TableCell className="whitespace-nowrap">{formatDateTime(audit.lastRun)}</TableCell>
                <TableCell>
                  <Badge variant={audit.result === 'fail' ? 'destructive' : 'secondary'}>
                    {auditResultLabels[audit.result]}
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
