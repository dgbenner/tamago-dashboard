import { useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { cardDoc, cardReader } from '@/data/system-card-docs'

/** One file, read two ways: the plain-English summary left, the file itself right (one at a time on phones). Pressing
 *  a summary title scrolls the file to the lines it describes. Lines the row isn't about are dimmed. */
export default function DocReader({ id, title }: { id: string; title: string }) {
  const doc = useMemo(() => cardDoc(id), [id])
  const [line, setLine] = useState<number | null>(null)
  const [view, setView] = useState<'summary' | 'file'>('summary')
  const pane = useRef<HTMLDivElement>(null)
  const target = line ?? doc.ranges[0][0]

  useEffect(() => {
    const box = pane.current
    const row = box?.querySelector<HTMLElement>(`[data-line="${target}"]`)
    if (box && row) box.scrollTop += row.getBoundingClientRect().top - box.getBoundingClientRect().top - 16
  }, [target, view])

  const inRange = (i: number) => doc.ranges.some(([from, to]) => i >= from && i < to)
  // A pressed title marks from its line to the next title's line, or the end of its part of the file.
  const ends = [...doc.sections.map((s) => s.line), ...doc.ranges.map(([, to]) => to), doc.lines.length].filter((n) => line !== null && n > line)
  const end = Math.min(...ends)
  const panel = 'min-h-0 min-w-0 flex-col lg:flex'
  const label = 'border-b px-5 py-2.5 text-[11px] font-bold tracking-[0.1em] text-muted-foreground uppercase'

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b py-4 pr-14 pl-5">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription className="mt-1 break-words">
          <span className="font-mono text-foreground">{doc.file}</span> · as of {cardReader.date}, commit {cardReader.commit}
        </DialogDescription>
      </div>
      <div className="flex gap-2 border-b px-5 py-2 lg:hidden">
        <Button size="sm" variant={view === 'summary' ? 'default' : 'outline'} aria-pressed={view === 'summary'} onClick={() => setView('summary')}>{cardReader.summaryLabel}</Button>
        <Button size="sm" variant={view === 'file' ? 'default' : 'outline'} aria-pressed={view === 'file'} onClick={() => setView('file')}>{cardReader.fileLabel}</Button>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-1 lg:grid-cols-[2fr_3fr] lg:divide-x">
        <div className={`${panel} ${view === 'summary' ? 'flex' : 'hidden'}`}>
          <p className={`${label} hidden lg:block`}>{cardReader.summaryLabel}</p>
          <div tabIndex={0} role="region" aria-label={cardReader.summaryLabel} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">
            {doc.sections.map((s) => (
              <div key={s.heading} className="mb-5 last:mb-0">
                <h3>
                  <Button
                    variant="link"
                    className={`h-auto! justify-start p-0! text-left text-sm font-semibold whitespace-normal! cursor-pointer ${line === s.line ? 'text-link!' : 'text-foreground!'}`}
                    onClick={() => { setLine(s.line); setView('file') }}
                  >
                    {s.heading}
                  </Button>
                </h3>
                <p className="mt-1 max-w-prose text-sm leading-relaxed text-foreground/80">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
        <div className={`${panel} ${view === 'file' ? 'flex' : 'hidden'}`}>
          <p className={`${label} hidden lg:block`}>{cardReader.fileLabel}</p>
          <div ref={pane} tabIndex={0} role="region" aria-label={cardReader.fileLabel} className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-muted/50 py-4 font-mono text-xs leading-relaxed">
            {doc.lines.map((text, i) => (
              <div key={i} data-line={i} className={`flex gap-3 px-4 ${line !== null && i >= line && i < end ? 'bg-tamago-yellow/25' : ''} ${inRange(i) ? '' : 'text-muted-foreground'}`}>
                <span aria-hidden="true" className="w-8 shrink-0 text-right text-muted-foreground select-none">{i + 1}</span>
                <span className="min-w-0 flex-1 break-words whitespace-pre-wrap">{text || ' '}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
