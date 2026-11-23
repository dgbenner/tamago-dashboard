import type { ReactNode } from 'react'

import { formatDate, recentDeploys } from '@/data'
import { HierarchyLegend } from '@/layout/HierarchyLegend'
import { PageFrame, PageSection } from '@/layout/PageFrame'

interface ContentHealthPageProps {
  /** The four stat cards. Lays out its own responsive grid. */
  stats: ReactNode
  /** The languages table, already inside its own Card. */
  languages: ReactNode
  /** The sentences-per-language table, already inside its own Card. */
  sentences: ReactNode
  /** The deploys table, already inside its own Card. */
  deploys: ReactNode
}

/** The Content Health page: header, then stats row, languages table, sentences table, deploys table. */
export function ContentHealthPage({ stats, languages, sentences, deploys }: ContentHealthPageProps) {
  // Newest first; undefined when the snapshot has no deploys.
  const latest = recentDeploys.at(0)

  return (
    <PageFrame
      title="Content Health"
      description="The state of every language course: content, checks and deploys."
      aside={<HierarchyLegend />}
      note={
        latest ? (
          <>
            Latest deploy:{' '}
            <span className="font-medium text-foreground">
              {latest.name} {latest.number}
            </span>
            , <time dateTime={latest.date}>{formatDate(latest.date)}</time>
          </>
        ) : undefined
      }
    >
      <PageSection label="Key Numbers">{stats}</PageSection>
      <PageSection label="Languages">{languages}</PageSection>
      <PageSection label="Vocabulary and Content">{sentences}</PageSection>
      <PageSection label="Recent Deploys">{deploys}</PageSection>
    </PageFrame>
  )
}
