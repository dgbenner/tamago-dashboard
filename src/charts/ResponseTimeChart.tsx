import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { NOT_MEASURED } from '@/data'

const title = 'Response time'

/**
 * Where the response-time line chart will go. Nothing measures response time yet, so the card says
 * so instead of drawing a line: no chart and no numbers until a real check exists.
 */
export function ResponseTimeChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex h-32 w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border px-4 text-center">
          <p className="text-sm font-medium text-foreground">{NOT_MEASURED}</p>
          <p className="max-w-prose text-xs text-muted-foreground">
            A line appears here once a check visits the site every few minutes.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
