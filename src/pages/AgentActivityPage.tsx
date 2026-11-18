import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Agent activity page: header with the Sample data badge, then stats, chart, table. */
export function AgentActivityPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Agent activity"
      description="What the agents did."
      {...props}
    />
  )
}
