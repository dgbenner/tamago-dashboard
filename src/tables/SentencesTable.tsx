import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  formatCount,
  languageColumnHelp,
  liveLanguages,
  type LanguageColumnHelpKey,
  type RealLanguage,
} from '@/data'

import { cell, EMPTY, numberCell, pinnedCell, pinnedRow } from './cells'
import { SortableHead, type HeadAlign } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'sentences' | 'sentencesTatoeba' | 'sentencesDrafted' | 'draftsWaiting'

interface Column {
  key: ColumnKey
  label: string
  help: LanguageColumnHelpKey
  align?: HeadAlign
}

// Drafted and Awaiting Native Check sit side by side: the second is the part of the first still unchecked.
const columns: Column[] = [
  { key: 'name', label: 'Language', help: 'language' },
  { key: 'sentences', label: 'Sentences', help: 'sentences', align: 'right' },
  { key: 'sentencesTatoeba', label: 'From Tatoeba', help: 'tatoeba', align: 'right' },
  { key: 'sentencesDrafted', label: 'Drafted', help: 'drafted', align: 'right' },
  { key: 'draftsWaiting', label: 'Awaiting Native Check', help: 'awaiting', align: 'right' },
]

// What each column sorts by. A null (no value in the snapshot) sorts last either way.
const sortValues: Record<ColumnKey, (row: RealLanguage) => SortValue> = {
  name: (row) => row.name,
  sentences: (row) => row.sentences,
  sentencesTatoeba: (row) => row.sentencesTatoeba,
  sentencesDrafted: (row) => row.sentencesDrafted,
  draftsWaiting: (row) => row.draftsWaiting,
}

/** A count, or the em dash when the snapshot has no value. */
function count(value: number | null): string {
  return value === null ? EMPTY : formatCount(value)
}

/** Where each live course's sentences come from. Coming-soon languages have none, so are left out. */
export function SentencesTable() {
  const { sorted, toggleSort, directionOf } = useSort(liveLanguages, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Sentences</CardTitle>
        <CardDescription>
          Where each course's sentences come from, and how many still need a native speaker's check.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) => (
                <SortableHead
                  key={column.key}
                  label={column.label}
                  direction={directionOf(column.key)}
                  onSort={() => toggleSort(column.key)}
                  align={column.align}
                  help={languageColumnHelp[column.help]}
                  className={i === 0 ? pinnedCell : undefined}
                />
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} className={pinnedRow}>
                <TableCell className={cn(cell, pinnedCell, 'font-medium whitespace-nowrap')}>
                  {row.name}
                </TableCell>
                <TableCell className={numberCell}>{count(row.sentences)}</TableCell>
                <TableCell className={numberCell}>{count(row.sentencesTatoeba)}</TableCell>
                <TableCell className={numberCell}>{count(row.sentencesDrafted)}</TableCell>
                <TableCell className={numberCell}>{count(row.draftsWaiting)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
