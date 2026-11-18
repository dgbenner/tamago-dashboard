// The fixed dates behind every "this week" / "this month" number. Nothing else hardcodes a date.

import periodsJson from './periods.json'
import { addDays, check } from './internal'
import type { IsoDate, Period, Periods } from './types'

/** today, thisWeek, thisMonth, last14Days, last30Days — read from periods.json. */
export const periods: Periods = periodsJson satisfies Periods

/** Today, 'YYYY-MM-DD'. */
export const today: IsoDate = periods.today

for (const [name, period] of Object.entries(periods)) {
  if (typeof period === 'string') continue
  check(period.end === today, `periods.${name} must end today`)
  check(period.start <= period.end, `periods.${name} starts after it ends`)
}
check(periods.thisWeek.start === addDays(today, -6), 'periods.thisWeek must be the last 7 days')
check(periods.last14Days.start === addDays(today, -13), 'periods.last14Days must be the last 14 days')
check(periods.last30Days.start === addDays(today, -29), 'periods.last30Days must be the last 30 days')
check(periods.thisMonth.start === `${today.slice(0, 7)}-01`, 'periods.thisMonth must start on the 1st')

/** Whether a day (or the day of a date-time) falls inside a period, ends included. */
export function isInPeriod(date: string, period: Period): boolean {
  const day = date.slice(0, 10)
  return day >= period.start && day <= period.end
}

/** The rows whose `date` falls inside a period. */
export function inPeriod<T extends { date: IsoDate }>(rows: T[], period: Period): T[] {
  return rows.filter((row) => isInPeriod(row.date, period))
}
