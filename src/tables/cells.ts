// Shared by every table, so the tables stay one family.

/** What a cell shows when the data has no value for it (a null). Never 0. */
export const EMPTY = '—'

/** A number cell: right-aligned, one line, digits of equal width. */
export const numberCell = 'text-right whitespace-nowrap tabular-nums'

/**
 * The block inside a cell whose text may wrap (a list of changes, a sentence of detail). The Table
 * keeps every cell on one line by default; this lets long text wrap instead of stretching the table.
 */
export const wrappingText = 'min-w-64 max-w-lg whitespace-normal'
