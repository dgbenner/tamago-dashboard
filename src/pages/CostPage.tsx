import { MissingSourceNotice } from '@/layout/MissingSourceNotice'
import { DashboardPage, type DashboardPageProps } from '@/layout/PageFrame'

/** The Cost page (real data): header with the missing-billing banner, then stats, chart, table. Tokens are measured; dollars are not. */
export function CostPage(props: DashboardPageProps) {
  return (
    <DashboardPage
      title="Cost"
      description="What the agent runs cost: Claude Code tokens in the sessions working on Tamago."
      notice={
        <MissingSourceNotice>
          Dollar costs need a billing source, such as Anthropic's usage and cost report. Until one is connected, this page
          counts tokens only.
        </MissingSourceNotice>
      }
      {...props}
    />
  )
}
