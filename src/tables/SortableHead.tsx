import type { ReactNode } from 'react'
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { TableHead } from '@/components/ui/table'
import { cn } from '@/lib/utils'

import type { SortDirection } from './sort'

interface SortableHeadProps {
  /** The column heading. */
  children: ReactNode
  /** The column's current sort direction, or 'none' when another column (or nothing) is sorted. */
  direction: SortDirection | 'none'
  /** Called when the heading is clicked. */
  onSort: () => void
  /** Right-align the heading, for number columns. */
  numeric?: boolean
}

/** A column heading that sorts its table: a ghost Button in a TableHead, with `aria-sort`. */
export function SortableHead({ children, direction, onSort, numeric = false }: SortableHeadProps) {
  const Icon = direction === 'ascending' ? ArrowUp : direction === 'descending' ? ArrowDown : ArrowUpDown
  const icon = (
    <Icon aria-hidden="true" className={cn(direction === 'none' && 'text-muted-foreground')} />
  )

  return (
    <TableHead aria-sort={direction} className={cn(numeric && 'text-right')}>
      {/* The negative margin lines the heading text up with the cell text below it. In number
          columns the icon comes first, so the text still ends where the numbers end. */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onSort}
        className={numeric ? '-mr-2.5' : '-ml-2.5'}
      >
        {numeric && icon}
        {children}
        {!numeric && icon}
      </Button>
    </TableHead>
  )
}
