import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Content Growth page (real data): header, then stats, chart, table. */
export function GrowthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Content Growth"
      description="How much Tamago's content has grown."
      {...props}
    />
  )
}
