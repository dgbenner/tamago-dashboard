// Small helpers shared by the data modules. Not re-exported from '@/data'.

import type { IsoDate } from './types'

/** Check a JSON string against a fixed set of words when the module loads. */
export function oneOf<T extends string>(allowed: readonly T[], value: string, where: string): T {
  if ((allowed as readonly string[]).includes(value)) return value as T
  throw new Error(`src/data: ${where} is "${value}", expected one of ${allowed.join(', ')}`)
}

/** Stop the module loading when the JSON breaks one of its own rules. */
export function check(condition: boolean, message: string): asserts condition {
  if (!condition) throw new Error(`src/data: ${message}`)
}

/** 'YYYY-MM-DD' → a Date at midnight UTC, so nothing depends on the machine's time zone. */
export function toUtcDate(date: IsoDate): Date {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day))
}

/** The day `days` after `date` (negative goes back), as 'YYYY-MM-DD'. */
export function addDays(date: IsoDate, days: number): IsoDate {
  const d = toUtcDate(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Every day from `start` to `end`, both included. */
export function daysBetween(start: IsoDate, end: IsoDate): IsoDate[] {
  const days: IsoDate[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) days.push(d)
  return days
}
