import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cefrGroups, cefrLadder } from '@/data'

import { CefrGroupChip } from './CefrGroupChip'
import { CefrSection } from './CefrSection'

const shortName = new Map(cefrGroups.map((group) => [group.id, group.short]))

/**
 * The six CEFR levels as a ladder of cards: six across on a wide screen, fewer as it narrows, one column on a phone.
 * The small Pre-A1 chip comes first. The accent badge sits on the highest level a Tamago course has completed.
 */
export function CefrLadder() {
  return (
    <CefrSection title={cefrLadder.title} intro={cefrLadder.intro}>
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-muted-foreground">
          {cefrLadder.preA1.code}
        </Badge>
        <span>{cefrLadder.preA1.canDo}</span>
      </div>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cefrLadder.levels.map((level) => (
          <li key={level.code} className="min-w-0">
            <Card className={`h-full gap-3 py-4 ${level.tamagoBadge ? 'border-tamago-yellow' : ''}`}>
              <CardHeader className="gap-1">
                <p className="text-3xl font-semibold tracking-tight">{level.code}</p>
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{level.name}</p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <CefrGroupChip group={level.group} label={shortName.get(level.group) ?? level.group} />
                  {level.tamagoBadge ? (
                    <Badge className="border-transparent bg-tamago-yellow text-tamago-ink">{level.tamagoBadge}</Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex-1 text-sm">{level.canDo}</CardContent>
              <CardFooter>
                <Badge variant="secondary" className="tabular-nums">
                  {level.hours}
                </Badge>
              </CardFooter>
            </Card>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">{cefrLadder.footnote}</p>
    </CefrSection>
  )
}
