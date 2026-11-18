import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Health page: header with the Sample data badge, then stats, chart, table. */
export function HealthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Health"
      description="Whether the site is up and the builds pass."
      note="Real uptime needs a check that visits the site every few minutes. Mock data stands in for now."
      {...props}
    />
  )
}
