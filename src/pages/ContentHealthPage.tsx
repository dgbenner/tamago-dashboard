import type { ReactNode } from 'react'

import { formatDate, recentDeploys } from '@/data'
import { PageFrame, PageSection } from '@/layout/PageFrame'

interface ContentHealthPageProps {
  /** The four stat cards. Lays out its own responsive grid. */
  stats: ReactNode
  /** The languages table, already inside its own Card. */
  languages: ReactNode
  /** The deploys table, already inside its own Card. */
  deploys: ReactNode
}

/** The Content health page: header, then stats row, languages table, deploys table. */
export function ContentHealthPage({ stats, languages, deploys }: ContentHealthPageProps) {
  // Newest first; undefined when the snapshot has no deploys.
  const latest = recentDeploys.at(0)

  return (
    <PageFrame
      title="Content health"
      description="The state of every language course, and the builds that shipped them."
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
      <PageSection label="Key numbers">{stats}</PageSection>
      <PageSection label="Languages">{languages}</PageSection>
      <PageSection label="Deploys">{deploys}</PageSection>
    </PageFrame>
  )
}
