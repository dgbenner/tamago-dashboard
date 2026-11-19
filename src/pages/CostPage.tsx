import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Cost page: header with the Sample data badge, then stats, chart, table. */
export function CostPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Cost"
      description="What the agent runs cost."
      sample
      {...props}
    />
  )
}
