import { MissingSourceNotice } from '@/layout/MissingSourceNotice'
import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The System Health page (real data, no badge): header with the missing-check banner, then stats, chart, table. */
export function HealthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="System Health"
      description="Monitors Tamago's infrastructure: whether the site is up, how fast it responds, and whether its builds and test runs pass or fail."
      notice={
        <MissingSourceNotice>
          Uptime and response time need a check that visits the site every few minutes. That check does not exist yet.
        </MissingSourceNotice>
      }
      {...props}
    />
  )
}
