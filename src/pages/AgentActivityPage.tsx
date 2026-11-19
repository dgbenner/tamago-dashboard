import { activityNotRecorded } from '@/data'
import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Agent activity page (real data, no badge): header, then stats, chart, table. */
export function AgentActivityPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Agent Activity"
      description="What the repo and GitHub record."
      note={
        activityNotRecorded.length > 0
          ? 'Not recorded anywhere yet: ' + activityNotRecorded.join(', ')
          : undefined
      }
      {...props}
    />
  )
}
