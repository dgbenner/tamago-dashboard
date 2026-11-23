import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatDate, reviewsApplied } from '@/data'

import { cn } from '@/lib/utils'

import { cell, head, wrappingText } from './cells'

const columns = ['Date', 'What Was Applied']

export function ReviewsAppliedTable() {
  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Reviews Applied</CardTitle>
        <CardDescription>
          The commits that record a review being applied to the course.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((label) => (
                <TableHead key={label} className={head}>{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviewsApplied.length === 0 && (
              <TableRow>
                <TableCell colSpan={columns.length} className={cn(cell, 'text-muted-foreground')}>
                  No applied reviews are recorded.
                </TableCell>
              </TableRow>
            )}
            {reviewsApplied.map((review, i) => (
              <TableRow key={`${review.date}-${i}`}>
                <TableCell className={cn(cell, 'align-top whitespace-nowrap')}>{formatDate(review.date)}</TableCell>
                <TableCell className={cn(cell, 'align-top')}>
                  <div className={cn(wrappingText, 'text-muted-foreground italic')}>{review.subject}</div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
