import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Cost page (real data): tokens are measured; dollars need a billing source, so those cards say so. */
export function CostPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Cost"
      description="What the agent runs cost: Claude Code tokens in the sessions working on Tamago."
      {...props}
    />
  )
}
