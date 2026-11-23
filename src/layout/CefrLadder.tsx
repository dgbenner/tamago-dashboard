import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { cefrGroups, cefrLadder } from '@/data'

import { CefrGroupRibbon } from './CefrGroupChip'
import { CefrSection } from './CefrSection'

const shortName = new Map(cefrGroups.map((group) => [group.id, group.short]))

/**
 * The six CEFR levels as a ladder of cards: six across on a wide screen, fewer as it narrows, one column on a phone.
 * Each card: the code with the group ribbon on the same line (wrapping behind the card's edge), the name, the can-do line, then the hours. The cards share their rows
 * (subgrid), so each of those starts at the same height across a row, however long a name or a can-do line.
 * The A1 card's yellow border marks the highest level a Tamago course has completed.
 */
export function CefrLadder() {
  return (
    <CefrSection title={cefrLadder.title} intro={cefrLadder.intro}>
      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cefrLadder.levels.map((level) => (
          <li key={level.code} className="row-span-3 grid min-w-0 grid-rows-subgrid">
            <Card className={`row-span-3 grid grid-rows-subgrid gap-3 py-5 ${level.tamagoBadge ? 'border-tamago-yellow' : ''}`}>
              <CardHeader className="content-start gap-1">
                {/* The code and the ribbon share one line, centred on each other. The ribbon runs past the header
                    padding (24px) and the border (1px) by its 6px overhang. */}
                <div className="-mt-1.5 flex items-center justify-between gap-2">
                  <p className="text-3xl leading-none font-semibold tracking-tight">{level.code}</p>
                  <CefrGroupRibbon group={level.group} label={shortName.get(level.group) ?? level.group} className="-mr-[31px]" />
                </div>
                <p className="text-[11px] font-medium tracking-wider text-muted-foreground uppercase">{level.name}</p>
              </CardHeader>
              <CardContent className="text-sm">{level.canDo}</CardContent>
              <CardFooter className="items-center justify-center px-2 py-1 text-xs whitespace-nowrap text-muted-foreground italic tabular-nums">
                {cefrLadder.approx} {level.hours}
              </CardFooter>
            </Card>
          </li>
        ))}
      </ol>
      <p className="w-[80%] text-xs text-muted-foreground italic">{cefrLadder.footnote}</p>
    </CefrSection>
  )
}
