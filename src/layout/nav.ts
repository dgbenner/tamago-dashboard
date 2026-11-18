import { Activity, Bot, CircleDollarSign, HeartPulse, TrendingUp, type LucideIcon } from 'lucide-react'

export type PageId = 'content-health' | 'growth' | 'health' | 'agent-activity' | 'cost'

/** The sidebar items, in display order. Every item has a page. */
export const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon }[] = [
  { id: 'content-health', label: 'Content health', icon: Activity },
  { id: 'growth', label: 'Growth', icon: TrendingUp },
  { id: 'health', label: 'Health', icon: HeartPulse },
  { id: 'agent-activity', label: 'Agent activity', icon: Bot },
  { id: 'cost', label: 'Cost', icon: CircleDollarSign },
]

/** The hash link for a page. The coordinator's router in `src/App.tsx` reads the same shape. */
export function pageHref(id: PageId): string {
  return '#/' + id
}
