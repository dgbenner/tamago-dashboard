import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { CEFR_LEVELS, cefrExams, examRows, type ExamPart } from '@/data'
import { cn } from '@/lib/utils'

import { EMPTY, cell, head, pinnedCell, pinnedRow } from './cells'

/** The column Tamago's mock exams follow: a soft accent fill, rounded at its top and bottom, no border. */
const TAMAGO_COLUMN = 'bg-tamago-yellow/15'

/** One exam name, with its footnote number raised after it. */
function Exam({ part }: { part: ExamPart }) {
  return (
    <>
      {part.text || <span className="text-muted-foreground">{EMPTY}</span>}
      {part.note !== null ? <sup className="ml-0.5 text-[10px] text-muted-foreground">{part.note}</sup> : null}
    </>
  )
}

/** A grid of official exams: one row per Tamago course in the app, one column per CEFR level, with the footnotes in a closed Details accordion. */
export function ExamsTable() {
  const lastRow = examRows.length - 1

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle>{cefrExams.title}</CardTitle>
        <CardDescription>{cefrExams.intro}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={cn(head, pinnedCell)}>Language</TableHead>
              {CEFR_LEVELS.map((level) => (
                <TableHead
                  key={level}
                  className={cn(head, 'h-auto py-2 align-bottom', level === cefrExams.tamagoLevel && cn(TAMAGO_COLUMN, 'rounded-t-lg'))}
                >
                  {level === cefrExams.tamagoLevel ? (
                    <span className="block text-[10px] leading-tight font-normal whitespace-normal text-muted-foreground">
                      {cefrExams.tamagoColumn}
                    </span>
                  ) : null}
                  {level}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {examRows.map((row, r) => (
              <TableRow key={row.id} className={pinnedRow}>
                <TableCell className={cn(cell, pinnedCell, 'font-medium whitespace-nowrap')}>{row.name}</TableCell>
                {row.cells.map((parts, i) => (
                  <TableCell
                    key={CEFR_LEVELS[i]}
                    className={cn(
                      cell,
                      // The exam names are the data: regular weight, in the lighter description grey.
                      'min-w-28 align-top font-normal whitespace-normal text-muted-foreground',
                      CEFR_LEVELS[i] === cefrExams.tamagoLevel && cn(TAMAGO_COLUMN, r === lastRow && 'rounded-b-lg'),
                    )}
                  >
                    {parts.length === 0 ? (
                      <span className="text-muted-foreground">{EMPTY}</span>
                    ) : (
                      parts.map((part, p) => (
                        <span key={p}>
                          {p > 0 ? ' / ' : null}
                          <Exam part={part} />
                        </span>
                      ))
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Accordion type="single" collapsible>
          <AccordionItem value="details" className="border-b-0">
            <AccordionTrigger className="flex-none items-center justify-start gap-1.5 [&>svg]:translate-y-0 py-2 text-xs">{cefrExams.detailsLabel}</AccordionTrigger>
            <AccordionContent>
              <ol className="flex list-decimal flex-col gap-1 pl-5 text-xs text-muted-foreground">
                {cefrExams.footnotes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ol>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  )
}
