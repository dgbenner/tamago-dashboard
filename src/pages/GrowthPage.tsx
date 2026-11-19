import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Growth page: header with the Sample Data badge, then stats, chart, table. */
export function GrowthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Growth"
      description="How much Tamago's content has grown."
      sample
      {...props}
    />
  )
}
