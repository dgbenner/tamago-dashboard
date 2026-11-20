import { useState, type MouseEvent, type PointerEvent } from 'react'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { contentHierarchy, type HierarchyLevel } from '@/data'

/**
 * One level of the chain: a dotted-underlined word with its definition and example in a tooltip. Opens on hover or
 * focus like every tooltip, and also on a tap, since touch screens never hover. The tap only opens the tooltip; it never
 * sorts or navigates.
 */
function Level({ level }: { level: HierarchyLevel }) {
  const [open, setOpen] = useState(false)

  // A tap or click opens it (the tooltip's own click handler would close it); tapping anywhere else closes it.
  const show = (event: MouseEvent) => {
    event.preventDefault()
    setOpen(true)
  }

  return (
    <Tooltip open={open} onOpenChange={setOpen}>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="link"
          onClick={show}
          // A touch screen sends "pointer left" straight after the tap, which would close the tooltip at once.
          onPointerLeave={(event: PointerEvent) => {
            if (event.pointerType === 'touch') event.preventDefault()
          }}
          className="h-auto p-0 text-sm font-normal max-sm:text-[13px] text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
        >
          {level.name}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={4} className="max-w-xs text-left text-pretty">
        <p>
          <span className="font-semibold">{level.name}</span> — {level.definition}
        </p>
        <p className="mt-1 opacity-75">Example: {level.example}</p>
      </TooltipContent>
    </Tooltip>
  )
}

/** Tamago's content levels, largest first, as a breadcrumb-style chain: Course › Part › … › Question. */
export function HierarchyLegend() {
  return (
    <ol aria-label="Content hierarchy" className="flex flex-wrap items-center gap-x-2 gap-y-1 max-sm:gap-x-1 max-sm:mb-1.5">
      {contentHierarchy.levels.map((level, i) => (
        <li key={level.name} className="flex items-center gap-x-2 max-sm:gap-x-1">
          {i > 0 ? (
            <span aria-hidden="true" className="-mt-1 text-4xl leading-none max-sm:text-3xl font-light text-muted-foreground/60">
              ›
            </span>
          ) : null}
          <Level level={level} />
        </li>
      ))}
    </ol>
  )
}
