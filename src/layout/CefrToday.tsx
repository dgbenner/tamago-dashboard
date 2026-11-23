import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cefrToday, todayChips } from '@/data'

import { pageHref } from './nav'

/** The live strip: one chip per course in the app (level and circles, from the snapshot), each opening its row on Content Health. */
export function CefrToday() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{cefrToday.title}</CardTitle>
        <CardDescription>{cefrToday.intro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <ul className="flex flex-wrap gap-2">
          {todayChips.map((chip) => (
            <li key={chip.id}>
              <Button asChild variant="outline" className="h-auto flex-col items-start gap-0.5 px-3 py-2">
                <a href={pageHref('content-health', `language-${chip.id}`)}>
                  <span className="font-medium">{chip.name}</span>
                  {chip.level ? <span className="text-xs font-normal">{chip.level}</span> : null}
                  {chip.circles ? <span className="text-xs font-normal text-muted-foreground">{chip.circles}</span> : null}
                </a>
              </Button>
            </li>
          ))}
        </ul>
        {cefrToday.summary || cefrToday.awaiting ? (
          <p className="text-xs text-muted-foreground">
            {cefrToday.summary}
            {cefrToday.summary && cefrToday.awaiting ? ' ' : null}
            {cefrToday.awaiting ? (
              <>
                {cefrToday.awaiting.before}
                <a
                  href={pageHref('content-health', 'tile-drafts-waiting')}
                  className="underline decoration-dotted underline-offset-4 hover:text-foreground"
                >
                  {cefrToday.awaiting.link}
                </a>
                {cefrToday.awaiting.after}
              </>
            ) : null}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
