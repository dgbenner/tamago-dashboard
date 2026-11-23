import { Activity, Bot, CircleDollarSign, GraduationCap, HeartPulse, TrendingUp, type LucideIcon } from 'lucide-react'

export type PageId = 'content-health' | 'growth' | 'health' | 'agent-activity' | 'cost' | 'cefr'

/**
 * The sidebar items, in display order. Every item has a page.
 * `real` is true when the page shows data from the snapshot, false when it shows placeholder numbers.
 */
export const NAV_ITEMS: { id: PageId; label: string; icon: LucideIcon; real: boolean }[] = [
  { id: 'content-health', label: 'Content Health', icon: Activity, real: true },
  { id: 'growth', label: 'Content Growth', icon: TrendingUp, real: true },
  { id: 'health', label: 'System Health', icon: HeartPulse, real: true },
  { id: 'agent-activity', label: 'Agent Activity', icon: Bot, real: true },
  { id: 'cost', label: 'Cost', icon: CircleDollarSign, real: true },
  { id: 'cefr', label: 'CEFR', icon: GraduationCap, real: true },
]

/**
 * The hash link for a page, e.g. `#/growth`. With a target, the page opens scrolled to the element with that id,
 * e.g. `#/content-health/language-fr`. The coordinator's router in `src/App.tsx` reads the same shape.
 */
export function pageHref(id: PageId, target?: string): string {
  return '#/' + id + (target ? '/' + target : '')
}

/** Whether a page shows real data from the snapshot (true) or placeholder numbers (false). */
export function isRealPage(id: PageId): boolean {
  return NAV_ITEMS.some((item) => item.id === id && item.real)
}
