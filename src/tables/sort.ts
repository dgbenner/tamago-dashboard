import { useMemo, useState } from 'react'

export type SortDirection = 'ascending' | 'descending'

/** Which column is sorted and which way. `null` means the rows are in the order the data gives. */
export interface SortState<Key extends string> {
  key: Key
  direction: SortDirection
}

/**
 * The value a column sorts by: text is compared alphabetically, numbers numerically. `null` means
 * the row has no value for that column; those rows go last whichever way the column is sorted.
 */
export type SortValue = string | number | null

function compare(a: string | number, b: string | number): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b))
}

/**
 * Sort state for a table. `accessors` gives, for each sortable column, the value a row sorts by.
 * The first click on a column sorts it ascending, the next click descending. Rows that compare
 * equal keep the order the data gives.
 */
export function useSort<Row, Key extends string>(
  rows: readonly Row[],
  accessors: Record<Key, (row: Row) => SortValue>,
) {
  const [sort, setSort] = useState<SortState<Key> | null>(null)

  const sorted = useMemo(() => {
    if (!sort) return [...rows]
    const value = accessors[sort.key]
    const sign = sort.direction === 'ascending' ? 1 : -1
    return [...rows].sort((rowA, rowB) => {
      const a = value(rowA)
      const b = value(rowB)
      if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1
      return sign * compare(a, b)
    })
  }, [rows, accessors, sort])

  function toggleSort(key: Key) {
    setSort((current) =>
      current?.key === key && current.direction === 'ascending'
        ? { key, direction: 'descending' }
        : { key, direction: 'ascending' },
    )
  }

  /** The `aria-sort` value for a column's header. */
  function directionOf(key: Key): SortDirection | 'none' {
    return sort?.key === key ? sort.direction : 'none'
  }

  return { sorted, toggleSort, directionOf }
}
