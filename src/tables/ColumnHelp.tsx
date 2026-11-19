import { Info } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface ColumnHelpProps {
  /** The column heading, for the button's accessible name ("About <column>"). */
  column: string
  /** What the column means. */
  text: string
}

/** The small info button beside a column heading, with the column's explanation in a tooltip. */
export function ColumnHelp({ column, text }: ColumnHelpProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon-xs" aria-label={`About ${column}`} className="-ml-0.5 size-5">
          <Info aria-hidden="true" className="size-3.5 text-muted-foreground" />
        </Button>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs text-left text-pretty">{text}</TooltipContent>
    </Tooltip>
  )
}
