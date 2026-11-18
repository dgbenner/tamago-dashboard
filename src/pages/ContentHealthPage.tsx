import type { ReactNode } from 'react'

import { formatDate, latestDeploy } from '@/data'
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
  return (
    <PageFrame
      title="Content health"
      sample
      description="The state of every language course, and the builds that shipped them."
      note={
        <>
          Latest deploy: <span className="font-medium text-foreground">{latestDeploy.animal}</span>,{' '}
          <time dateTime={latestDeploy.date}>{formatDate(latestDeploy.date)}</time>
        </>
      }
    >
      <PageSection label="Key numbers">{stats}</PageSection>
      <PageSection label="Languages">{languages}</PageSection>
      <PageSection label="Deploys">{deploys}</PageSection>
    </PageFrame>
  )
}
