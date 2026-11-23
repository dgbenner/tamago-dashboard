import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cefrGroups, cefrLadder } from '@/data'

import { CefrGroupChip } from './CefrGroupChip'
import { CefrSection } from './CefrSection'

const shortName = new Map(cefrGroups.map((group) => [group.id, group.short]))

/** A chip centred on a card's top or bottom border, half over it. */
const ON_TOP_BORDER = 'absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
const ON_BOTTOM_BORDER = 'absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'

/**
 * The six CEFR levels as a ladder of cards: six across on a wide screen, fewer as it narrows, one column on a phone.
 * The group chip sits on each card's top border and the hours on its bottom border. The cards share their rows
 * (subgrid), so the codes, the names and the can-do lines start at the same height across a row, however long a name.
 * The A1 card's yellow border marks the highest level a Tamago course has completed.
 */
export function CefrLadder() {
  return (
    <CefrSection title={cefrLadder.title} intro={cefrLadder.intro}>
      <ol className="grid grid-cols-1 gap-x-3 gap-y-8 pt-3 pb-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cefrLadder.levels.map((level) => (
          <li key={level.code} className="row-span-2 grid min-w-0 grid-rows-subgrid">
            <Card
              className={`relative row-span-2 grid grid-rows-subgrid gap-2 pt-6 pb-7 ${level.tamagoBadge ? 'border-tamago-yellow' : ''}`}
            >
              <CefrGroupChip group={level.group} label={shortName.get(level.group) ?? level.group} className={ON_TOP_BORDER} />
              <CardHeader className="gap-1">
                <p className="text-3xl font-semibold tracking-tight">{level.code}</p>
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{level.name}</p>
              </CardHeader>
              <CardContent className="text-sm">{level.canDo}</CardContent>
              <Badge variant="secondary" className={`${ON_BOTTOM_BORDER} border-transparent tabular-nums`}>
                {level.hours}
              </Badge>
            </Card>
          </li>
        ))}
      </ol>
      <p className="text-xs text-muted-foreground italic">{cefrLadder.footnote}</p>
    </CefrSection>
  )
}
