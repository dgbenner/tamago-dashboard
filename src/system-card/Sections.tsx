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
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <p className="max-w-xl text-sm">{s.definition}</p>
        <Card className="gap-2 py-4">
          <CardContent className="flex flex-col gap-1.5 px-4 text-sm">
            {s.template.map((line) => (
              <p key={line.lead}>
                <strong className="font-semibold">{line.lead}</strong> <span className="text-muted-foreground">{line.text}</span>
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
      <Tabs defaultValue={s.agents[0].id} className="gap-3">
        <TabsList variant="line" aria-label="Agent">
          {s.agents.map((agent) => (
            <TabsTrigger key={agent.id} value={agent.id}>
              {agent.name}
            </TabsTrigger>
          ))}
        </TabsList>
        {s.agents.map((agent) => (
          <TabsContent key={agent.id} value={agent.id}>
            <Card className="py-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-28 sm:w-56">Story element</TableHead>
                    <TableHead>The {agent.name}’s agent story</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentStoryElements.map(({ key, label }) => {
                    const value = agent[key]
                    return (
                      <TableRow key={key} className="align-top hover:bg-transparent">
                        <TableCell className="py-3 align-top font-medium text-muted-foreground">{label}</TableCell>
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
      <Outro lines={s.outro} />
    </CardSection>
  )
}

/** 02: where Tamago helps, might help, and hands off, as three cards. */
export function SystemCardProduct() {
  const p = systemCardProduct
  return (
    <CardSection id={p.id} label={p.label} title={p.title} intro={p.intro}>
      <div className="grid gap-4 md:grid-cols-3">
        {p.columns.map((column) => (
          <Card key={column.id} className="gap-3">
            <CardHeader>
              <CardTitle>{column.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <Lines items={column.items} />
            </CardContent>
          </Card>
        ))}
      </div>
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
              <TableHead className="w-28 pl-6 sm:w-44">Category</TableHead>
              <TableHead>Do</TableHead>
              <TableHead>Avoid</TableHead>
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
              <TableHead className="pl-6">Part</TableHead>
              <TableHead>File</TableHead>
              <TableHead className="text-right">Words</TableHead>
              <TableHead className="pr-6">What it does</TableHead>
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
              <TableHead className="w-32 pl-6 sm:w-52">Industry Term</TableHead>
              <TableHead>Project Artifact</TableHead>
              <TableHead className="w-56 pr-6">Status</TableHead>
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
