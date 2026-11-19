import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { cn } from '@/lib/utils'
import {
  formatCount,
  languageColumnHelp,
  languagesWithContent,
  type LanguageColumnHelpKey,
  type RealLanguage,
} from '@/data'

import { EMPTY, cell, head, numberCell, pinnedCell, pinnedRow } from './cells'
import { SortableHead, type HeadAlign } from './SortableHead'
import { useSort, type SortValue } from './sort'

type ColumnKey = 'name' | 'sentences' | 'sentencesTatoeba' | 'sentencesDrafted' | 'draftsWaiting' | 'wordsWiktionary' | 'recordingsLinguaLibre'

interface Column {
  key: ColumnKey
  label: string
  /** The tooltip beside the heading; none when the column needs no explaining. */
  help?: LanguageColumnHelpKey
  /** false for a column that doesn't sort (Language). */
  sortable?: boolean
  align?: HeadAlign
}

// Drafted and Awaiting Native Check sit side by side: the second is the part of the first still unchecked.
const columns: Column[] = [
  { key: 'name', label: 'Language', sortable: false },
  { key: 'sentences', label: 'Sentences', help: 'sentences', align: 'right' },
  { key: 'sentencesDrafted', label: 'Drafted', help: 'drafted', align: 'right' },
  { key: 'draftsWaiting', label: 'Awaiting Native Check', help: 'awaiting', align: 'right' },
  // The three outside language sources, together and in alphabetical order (Dan, 2026-11-19).
  { key: 'recordingsLinguaLibre', label: 'From Lingua Libre', help: 'linguaLibre', align: 'right' },
  { key: 'sentencesTatoeba', label: 'From Tatoeba', help: 'tatoeba', align: 'right' },
  { key: 'wordsWiktionary', label: 'From Wiktionary', help: 'wiktionary', align: 'right' },
]

// What each column sorts by. A null (no value in the snapshot) sorts last either way.
const sortValues: Record<ColumnKey, (row: RealLanguage) => SortValue> = {
  name: (row) => row.name,
  sentences: (row) => row.sentences,
  sentencesTatoeba: (row) => row.sentencesTatoeba,
  sentencesDrafted: (row) => row.sentencesDrafted,
  draftsWaiting: (row) => row.draftsWaiting,
  wordsWiktionary: (row) => row.wordsWiktionary,
  recordingsLinguaLibre: (row) => row.recordingsLinguaLibre,
}

/** A count, or the em dash when the snapshot has no value. */
function count(value: number | null): string {
  return value === null ? EMPTY : formatCount(value)
}

/** Where each course's sentences come from: courses in the app and In Progress. Planned ones have none. */
export function SentencesTable() {
  const { sorted, toggleSort, directionOf } = useSort(languagesWithContent, sortValues)

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>Vocabulary and Content</CardTitle>
        <CardDescription>Count of each course's content and sources</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, i) =>
                column.sortable === false ? (
                  <TableHead key={column.key} className={cn(head, i === 0 && pinnedCell)}>
                    {column.label}
                  </TableHead>
                ) : (
                  <SortableHead
                    key={column.key}
                    label={column.label}
                    direction={directionOf(column.key)}
                    onSort={() => toggleSort(column.key)}
                    align={column.align}
                    help={column.help ? languageColumnHelp[column.help] : undefined}
                    className={i === 0 ? pinnedCell : undefined}
                  />
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((row) => (
              <TableRow key={row.id} className={pinnedRow}>
                <TableCell className={cn(cell, pinnedCell, 'font-medium whitespace-nowrap')}>
                  {row.name}
                </TableCell>
                <TableCell className={numberCell}>{count(row.sentences)}</TableCell>
                <TableCell className={numberCell}>{count(row.sentencesDrafted)}</TableCell>
                <TableCell className={numberCell}>{count(row.draftsWaiting)}</TableCell>
                <TableCell className={numberCell}>{count(row.recordingsLinguaLibre)}</TableCell>
                <TableCell className={numberCell}>{count(row.sentencesTatoeba)}</TableCell>
                <TableCell className={numberCell}>{count(row.wordsWiktionary)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
