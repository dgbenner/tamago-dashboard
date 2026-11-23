import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cefrToday, todayChips } from '@/data'

import { pageHref } from './nav'

/** The live strip, reversed out like the skill cards: one chip per course in the app (level and circles, from the snapshot), each opening its row on Content Health. */
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
              <Button
                asChild
                className="h-auto flex-col items-start gap-0.5 border-transparent bg-cefr-skill px-3 py-2 text-white hover:bg-cefr-skill/85 hover:text-white"
              >
                <a href={pageHref('content-health', `language-${chip.id}`)}>
                  <span className="font-medium">{chip.name}</span>
                  {chip.level ? <span className="text-xs font-normal">{chip.level}</span> : null}
                  {chip.circles ? <span className="text-xs font-normal text-white/70">{chip.circles}</span> : null}
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
