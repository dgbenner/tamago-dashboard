// Shared by every table, so the tables stay one family.

/** What a cell shows when the data has no value for it (a null). Never 0. */
export const EMPTY = '—'

/** Every body cell: a tighter row than the Table's default padding, same text size. */
export const cell = 'py-1.5'

/** Every heading cell: a little shorter than the Table's default, to match the tighter rows. */
export const head = 'h-9'

/** A number cell: right-aligned, one line, digits of equal width. */
export const numberCell = 'py-1.5 text-right whitespace-nowrap tabular-nums'

/** A badge cell (a status, a result): centred, heading and cells alike. */
export const centredCell = 'text-center'

/**
 * The block inside a cell whose text may wrap (a list of changes, a sentence of detail). The Table
 * keeps every cell on one line by default; this lets long text wrap instead of stretching the table.
 */
export const wrappingText = 'min-w-64 max-w-lg whitespace-normal'

/** Put on a TableRow whose first cell is pinned, so the pinned cell can follow the row's hover. */
export const pinnedRow = 'group'

/**
 * The first column, pinned while the table scrolls sideways: a solid card background so the scrolling
 * cells pass under it, and on hover the row's own hover colour (muted at 50%) laid over that card
 * background, so it matches the rest of the row exactly instead of looking patched.
 */
export const pinnedCell =
  'sticky left-0 z-10 bg-card group-hover:bg-[image:linear-gradient(color-mix(in_oklab,var(--color-muted)_50%,transparent),color-mix(in_oklab,var(--color-muted)_50%,transparent))]'
