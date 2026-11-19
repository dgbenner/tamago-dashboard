import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Health page (real data, no badge): header, then stats, chart, table. */
export function HealthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Health"
      description="Whether the site is up and the builds pass."
      note="Uptime and response time need a check that visits the site every few minutes. That check does not exist yet."
      {...props}
    />
  )
}
