import { Activity, Bot, CircleDollarSign, HeartPulse, TrendingUp, type LucideIcon } from 'lucide-react'

export type PageId = 'content-health' | 'growth' | 'health' | 'agent-activity' | 'cost'

/**
 * The sidebar items, in display order. Every item has a page.
 * `real` is true when the page shows data from the snapshot, false when it shows placeholder numbers.
 */
export const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon; real: boolean }[] = [
  { id: 'content-health', label: 'Content Health', icon: Activity, real: true },
  { id: 'growth', label: 'Content Growth', icon: TrendingUp, real: true },
  { id: 'health', label: 'System Health', icon: HeartPulse, real: true },
  { id: 'agent-activity', label: 'Agent Activity', icon: Bot, real: true },
  { id: 'cost', label: 'Cost', icon: CircleDollarSign, real: false },
]

/** The hash link for a page. The coordinator's router in `src/App.tsx` reads the same shape. */
export function pageHref(id: PageId): string {
  return '#/' + id
}

/** Whether a page shows real data from the snapshot (true) or placeholder numbers (false). */
export function isRealPage(id: PageId): boolean {
  return NAV_ITEMS.some((item) => item.id === id && item.real)
}
