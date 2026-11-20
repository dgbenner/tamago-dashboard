import { TriangleAlert } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The System Health page (real data, no badge): header with the missing-check banner, then stats, chart, table. */
export function HealthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="System Health"
      description="Monitors Tamago's infrastructure: whether the site is up, how fast it responds, and whether its builds and test runs pass or fail."
      notice={
        <Alert className="flex items-center justify-center gap-2 border-tamago-yellow bg-tamago-yellow/20 text-center [&>svg]:translate-y-0">
          <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-foreground" />
          <AlertDescription className="text-foreground">
            Uptime and response time need a check that visits the site every few minutes. That check does not exist yet.
          </AlertDescription>
        </Alert>
      }
      {...props}
    />
  )
}
