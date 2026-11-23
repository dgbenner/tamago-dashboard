import { activityNotice } from '@/data'
import { MissingSourceNotice } from '@/layout/MissingSourceNotice'
import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/**
 * The Agent Activity page (real data, no badge): header with the yellow banner for what no record holds yet, then
 * stats, chart, table. The banner goes once everything is recorded.
 */
export function AgentActivityPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Agent Activity"
      description="What the agents did, as the repo and GitHub record it: commits, pushes, deploys and reviews applied."
      notice={activityNotice ? <MissingSourceNotice>{activityNotice}</MissingSourceNotice> : undefined}
      {...props}
    />
  )
}
