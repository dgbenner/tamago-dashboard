import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Growth page: header with the Sample data badge, then stats, chart, table. */
export function GrowthPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Growth"
      description="How much Tamago's content has grown."
      {...props}
    />
  )
}
