import { stats } from '@/data'

import { StatCard } from './StatCard'

/** The row of stat cards: one column on a phone, two from `sm`, four from `xl`. */
export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.id} stat={stat} />
      ))}
    </div>
  )
}
