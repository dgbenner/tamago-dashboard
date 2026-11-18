import type { ReactNode } from 'react'

import { Badge } from '@/components/ui/badge'

interface PageFrameProps {
  /** The page title, shown as the h1. */
  title: string
  /** One line under the title. */
  description: string
  /** Shows a "Sample data" badge next to the title. */
  sample?: boolean
  /** A short, smaller muted line under the description. */
  note?: ReactNode
  /** The page's sections, usually `PageSection`s, stacked in order. */
  children: ReactNode
}

/** The frame every page shares: max width, padding, the header, then the sections in a stack. */
export function PageFrame({ title, description, sample = false, note, children }: PageFrameProps) {
  const heading = <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>

  return (
    <div className="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <header className="flex min-w-0 flex-col gap-1">
        {sample ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            {heading}
            <Badge variant="outline">Sample data</Badge>
          </div>
        ) : (
          heading
        )}
        <p className="text-sm text-muted-foreground">{description}</p>
        {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
      </header>

      {children}
    </div>
  )
}

/**
 * One slot in the stack. `min-w-0` so a wide table or chart scrolls inside itself instead of
 * stretching the page.
 */
export function PageSection({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="min-w-0">
      {children}
    </section>
  )
}

/** The three slots every sample-data page takes. */
export interface DashboardPageProps {
  /** The stat cards. Lays out its own responsive grid. */
  stats: ReactNode
  /** The chart, already inside its own Card with a title. */
  chart: ReactNode
  /** The table, already inside its own Card with a title. */
  table: ReactNode
}

/** A sample-data page: header with the badge, then stats, chart, table. */
export function DashboardPage({
  title,
  description,
  note,
  stats,
  chart,
  table,
}: DashboardPageProps & { title: string; description: string; note?: ReactNode }) {
  return (
    <PageFrame title={title} description={description} note={note} sample>
      <PageSection label="Key numbers">{stats}</PageSection>
      <PageSection label="Chart">{chart}</PageSection>
      <PageSection label="Table">{table}</PageSection>
    </PageFrame>
  )
}
