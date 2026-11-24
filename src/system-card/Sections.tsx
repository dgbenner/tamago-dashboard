import { Check, ExternalLink, X } from 'lucide-react'
import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  agentStoryElements,
  evalStatusLabels,
  systemCardEvaluation,
  systemCardProduct,
  systemCardScope,
  systemCardSpec,
  systemCardStories,
  type EvalStatus,
} from '@/data'

/** Small capitals for the second layer of text: column headers, tab labels, the fit headings (Dan, 2026-11-24). */
const CAPS = 'text-[11px] font-bold tracking-[0.1em] uppercase'

/** One numbered section of the System Card: a small label, the title, one line of intro, then its content. */
function CardSection({ id, label, title, intro, children }: { id: string; label: string; title: string; intro: string; children: ReactNode }) {
  return (
    <section id={id} aria-label={title} className="flex min-w-0 scroll-mt-8 flex-col gap-4">
      <div className="mb-4 flex max-w-3xl flex-col">
        <p className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <h2 className="text-2xl font-semibold tracking-tight sm:text-[1.75rem] sm:leading-tight">{title}</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">{intro}</p>
      </div>
      {children}
    </section>
  )
}

/** Two closing lines under a section, quieter than the content. */
function Outro({ lines }: { lines: string[] }) {
  return (
    <div className="flex max-w-3xl flex-col gap-1 text-sm text-muted-foreground">
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </div>
  )
}

function Lines({ items }: { items: string[] }) {
  if (items.length === 1) return <p>{items[0]}</p>
  return (
    <ul className="flex list-disc flex-col gap-1 pl-4 marker:text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

/** 01: the agent story template, then one tab per agent with its story filled in. */
export function SystemCardStories() {
  const s = systemCardStories
  return (
    <CardSection id={s.id} label={s.label} title={s.title} intro={s.intro}>
      <figure className="my-6 flex max-w-xl flex-col gap-3">
        {/* The title sits above the card, like Agent Stories above the tabs (Dan, 2026-11-24). */}
        <h3 className="text-base leading-snug font-semibold">{s.templateTitle}</h3>
        {/* Reversed out (Dan, 2026-11-24): dark card, light text. */}
        <Card className="gap-3 border-foreground bg-foreground py-5 text-background">
          <CardContent className="flex flex-col gap-1.5 px-5 text-sm">
            {s.template.map((line) => (
              <p key={line.lead}>
                <strong className="font-semibold">{line.lead}</strong> <span className="text-background/65">{line.text}</span>
              </p>
            ))}
          </CardContent>
        </Card>
        <figcaption className="px-1 text-center text-xs leading-relaxed text-muted-foreground/70 italic">{s.definition}</figcaption>
      </figure>
      {/* Folder tabs (Dan, 2026-11-24): each agent a tab with its own border, the open one joined to the table card
          below it (the row overlaps the card's top border by a pixel, and a strip in the card's color covers it under the open tab).
          Six tabs are wider than a phone, so the row scrolls sideways there. */}
      <h3 className="mt-4 text-base leading-snug font-semibold">{s.tabsTitle}</h3>
      {/* The library's tab classes are merged without dropping conflicts, so the folder-tab look is marked ! to win
          (without it the row kept its 36 px height and cut the tabs' tops, and Firefox drew the library's focus ring
          after a click). No separate focus mark: the arrow keys move focus and open that tab together (Radix's automatic
          activation), so the open tab is where keyboard focus is. */}
      <Tabs defaultValue={s.agents[0].id} className="gap-0">
        <TabsList aria-label="Agent" className="relative z-10 -mb-px h-auto! w-full justify-start gap-1 overflow-x-auto overflow-y-hidden rounded-none! bg-transparent! p-0! [scrollbar-width:none] sm:gap-1.5">
          {s.agents.map((agent) => (
            <TabsTrigger
              key={agent.id}
              value={agent.id}
              className="relative h-auto! flex-none! cursor-pointer data-[state=active]:cursor-default rounded-t-lg! rounded-b-none! border! border-b-0! border-foreground! bg-foreground! px-3! py-3! text-[11px]! font-bold! tracking-[0.1em] uppercase text-background/75! shadow-none! ring-0! outline-none! after:hidden hover:bg-foreground/85! hover:text-background! sm:px-5! data-[state=active]:z-10 data-[state=active]:border-border! data-[state=active]:bg-card! data-[state=active]:text-foreground! data-[state=active]:before:absolute data-[state=active]:before:inset-x-0 data-[state=active]:before:bottom-0 data-[state=active]:before:h-px data-[state=active]:before:bg-card data-[state=active]:before:content-['']"
            >
              {agent.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {s.agents.map((agent) => (
          <TabsContent key={agent.id} value={agent.id}>
            <Card className="rounded-tl-none py-0">
              <Table>
                <TableBody>
                  {agentStoryElements.map(({ key, label }) => {
                    const value = agent[key]
                    return (
                      <TableRow key={key} className="align-top hover:bg-transparent">
                        <TableCell className="w-28 py-3 align-top font-medium text-muted-foreground sm:w-56">{label}</TableCell>
                        <TableCell className="py-3 align-top whitespace-normal">{Array.isArray(value) ? <Lines items={value} /> : <p className="max-w-2xl">{value}</p>}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </CardSection>
  )
}

/** Each column's heading color: green where it helps, grey for the judgement call, red where it hands off. */
const FIT_HEADING: Record<string, string> = { helps: 'text-chart-6', maybe: 'text-foreground/65', 'hands-off': 'text-destructive' }

/**
 * 02: where Tamago helps, might help, and hands off. The fit matrix from danbenner.com/stealth.html (Dan, 2026-11-24):
 * one panel in three columns with rules between them, the middle one the literal grey area, and small capital headings
 * in green, grey and red.
 */
export function SystemCardProduct() {
  const p = systemCardProduct
  return (
    <CardSection id={p.id} label={p.label} title={p.title} intro={p.intro}>
      <Card className="grid gap-0 divide-y overflow-hidden py-0 shadow-none md:grid-cols-3 md:divide-x md:divide-y-0">
        {p.columns.map((column) => (
          <div key={column.id} className={`pt-[30px] pr-8 pb-6 pl-[30px] ${column.id === 'maybe' ? 'bg-muted/60' : ''}`}>
            <h3 className={`mb-3 ${CAPS} ${FIT_HEADING[column.id] ?? ''}`}>{column.title}</h3>
            <div className="text-sm leading-relaxed">
              <Lines items={column.items} />
            </div>
          </div>
        ))}
      </Card>
    </CardSection>
  )
}

/** 03: the model's goal, then what is in and out of its scope. */
export function SystemCardScope() {
  const m = systemCardScope
  return (
    <CardSection id={m.id} label={m.label} title={m.title} intro={m.intro}>
      <Card className="gap-1 border-tamago-yellow bg-tamago-yellow/20 py-4">
        <CardContent className="flex flex-wrap items-baseline gap-x-3 gap-y-1 px-4">
          <span className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Model Goal</span>
          <span className="font-semibold">{m.goal}</span>
        </CardContent>
      </Card>
      <Card className="gap-0 pb-0">
        <CardHeader className="pb-4">
          <CardTitle>{m.tableTitle}</CardTitle>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={`w-28 pl-6 sm:w-44 ${CAPS} text-muted-foreground`}>Category</TableHead>
              <TableHead className={`${CAPS} text-muted-foreground`}>Do</TableHead>
              <TableHead className={`${CAPS} text-muted-foreground`}>Avoid</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {m.rows.map((row) => (
              <TableRow key={row.category} className="hover:bg-transparent">
                <TableCell className="pl-6 font-medium">{row.category}</TableCell>
                <TableCell className="whitespace-normal">
                  <span className="flex items-start gap-2">
                    <Check aria-label="Do" className="mt-0.5 size-4 shrink-0 text-foreground" />
                    {row.do}
                  </span>
                </TableCell>
                <TableCell className="whitespace-normal text-muted-foreground">
                  <span className="flex items-start gap-2">
                    <X aria-label="Avoid" className="mt-0.5 size-4 shrink-0" />
                    {row.avoid}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
      <Outro lines={m.outro} />
    </CardSection>
  )
}

/** 04: every written rule and prompt, with its word count and the total. */
export function SystemCardSpec() {
  const sp = systemCardSpec
  return (
    <CardSection id={sp.id} label={sp.label} title={sp.title} intro={`${sp.intro} ${sp.aboutLabel} of English, no code.`}>
      <Card className="gap-0 pb-0">
        <CardHeader className="pb-4">
          <CardTitle>Rules and Prompts</CardTitle>
          <CardDescription>Counted on {sp.countedOn}</CardDescription>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={`pl-6 ${CAPS} text-muted-foreground`}>Part</TableHead>
              <TableHead className={`${CAPS} text-muted-foreground`}>File</TableHead>
              <TableHead className={`text-right ${CAPS} text-muted-foreground`}>Words</TableHead>
              <TableHead className={`pr-6 ${CAPS} text-muted-foreground`}>What it does</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sp.rows.map((row) => (
              <TableRow key={row.part} className="hover:bg-transparent">
                <TableCell className="pl-6 font-medium">{row.part}</TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{row.file}</code>
                </TableCell>
                <TableCell className="text-right tabular-nums">{row.wordsLabel}</TableCell>
                <TableCell className="min-w-64 pr-6 whitespace-normal text-muted-foreground">{row.does}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="hover:bg-transparent">
              <TableCell className="pl-6 font-semibold" colSpan={2}>
                Total
              </TableCell>
              <TableCell className="text-right font-semibold tabular-nums">{sp.totalLabel}</TableCell>
              <TableCell />
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
      <p className="max-w-3xl text-sm text-muted-foreground">{sp.note}</p>
    </CardSection>
  )
}

const STATUS_VARIANT: Record<EvalStatus, 'default' | 'secondary' | 'outline'> = { built: 'default', progress: 'secondary', planned: 'outline' }

/** 05: industry eval terms, each matched to the piece of the project that does that job. */
export function SystemCardEvaluation() {
  const e = systemCardEvaluation
  return (
    <CardSection id={e.id} label={e.label} title={e.title} intro={e.intro}>
      <Card className="py-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={`w-32 pl-6 sm:w-52 ${CAPS} text-muted-foreground`}>Industry Term</TableHead>
              <TableHead className={`${CAPS} text-muted-foreground`}>Project Artifact</TableHead>
              <TableHead className={`w-56 pr-6 ${CAPS} text-muted-foreground`}>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {e.rows.map((row) => (
              <TableRow key={row.term} className="align-top hover:bg-transparent">
                <TableCell className="py-3 align-top pl-6 font-medium whitespace-normal">{row.term}</TableCell>
                <TableCell className="min-w-72 py-3 whitespace-normal">{row.artifact}</TableCell>
                <TableCell className="py-3 align-top pr-6">
                  <div className="flex flex-col items-start gap-1.5">
                    <Badge variant={STATUS_VARIANT[row.status]}>{evalStatusLabels[row.status]}</Badge>
                    {row.link && row.href ? (
                      <a href={row.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm underline underline-offset-4 hover:text-muted-foreground">
                        {row.link}
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                        <span className="sr-only">(opens in a new tab)</span>
                      </a>
                    ) : row.link ? (
                      <span className="text-sm text-muted-foreground">{row.link}</span>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </CardSection>
  )
}
