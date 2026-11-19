import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { head } from './cells'
import { ColumnHelp } from './ColumnHelp'
import type { SortDirection } from './sort'

export type HeadAlign = 'left' | 'right' | 'center'

interface SortableHeadProps {
  /** The column heading. */
  label: string
  /** The column's current sort direction, or 'none' when another column (or nothing) is sorted. */
  direction: SortDirection | 'none'
  /** Called when the heading is clicked. */
  onSort: () => void
  /** 'right' for number columns, 'center' for badge columns. */
  align?: HeadAlign
  /** What the column means. When given, an info button with a tooltip sits right of the label. */
  help?: string
  /** Extra classes for the TableHead, e.g. to pin the first column. */
  className?: string
}

const justify: Record<HeadAlign, string> = {
  left: 'justify-start',
  right: 'justify-end',
  center: 'justify-center',
}

/**
 * A column heading that sorts its table: a ghost Button in a TableHead, with `aria-sort`. The info
 * button, when there is one, sits beside the sort button rather than inside it, so it never sorts.
 */
export function SortableHead({
  label,
  direction,
  onSort,
  align = 'left',
  help,
  className,
}: SortableHeadProps) {
  const Icon = direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown
  const icon = (
    <Icon aria-hidden="true" className={cn(direction === 'none' && 'text-muted-foreground')} />
  )
  return (
    <TableHead aria-sort={direction} className={cn(head, className)}>
      {/* One order in every column (Dan, 2026-11-19): label, sort arrows, info button, kept close
          together and aligned as a group. The negative margin lines a left-aligned label up with the
          cells below it; in a right-aligned column the group ends at the column's edge. */}
      <div className={cn('flex items-center gap-0', justify[align])}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSort}
          className={cn('gap-1 px-1.5 has-[>svg]:px-1.5', align === 'left' && '-ml-1.5', align === 'right' && !help && '-mr-1.5')}
        >
          {label}
          {icon}
        </Button>
        {help && <ColumnHelp column={label} text={help} />}
      </div>
    </TableHead>
  )
}
