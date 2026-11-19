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

/** Fill the `{name}` slots of a labels.json text, e.g. fill("{live} of {total}", { live: "6", total: "6" }). */
export function fill(template: string, vars: Record<string, string> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = vars[key]
    if (value === undefined) throw new Error(`src/data: the text "${template}" needs a value for {${key}}`)
    return value
  })
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const DATE_TIME = /^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2})(:\d{2})?(?:\.\d+)?(Z|[+-]\d{2}:\d{2})?$/

/** '+HH:mm' / '-HH:mm' → minutes east of UTC, e.g. '-06:00' → -360. */
export function offsetMinutes(offset: string): number {
  const sign = offset.startsWith('-') ? -1 : 1
  const [hours, minutes] = offset.slice(1).split(':').map(Number)
  return sign * (hours * 60 + minutes)
}

/**
 * Any date or date-time the data holds → the wall-clock digits to show, 'YYYY-MM-DD' or
 * 'YYYY-MM-DDTHH:mm:ss'. A time with no zone or with an offset keeps its digits as written. A UTC
 * time ('…Z') is moved to `zoneOffsetMinutes` (the snapshot's own offset). The machine's time zone
 * is never used.
 */
export function toWallClock(value: string, zoneOffsetMinutes: number): string {
  if (DATE_ONLY.test(value)) return value
  const match = DATE_TIME.exec(value)
  if (!match) throw new Error(`src/data: "${value}" is not a date or a date-time`)
  const [, minutesPart, seconds = ':00', zone] = match
  if (zone !== 'Z') return `${minutesPart}${seconds}`
  const utc = Date.parse(`${minutesPart}${seconds}Z`)
  return new Date(utc + zoneOffsetMinutes * 60_000).toISOString().slice(0, 19)
}
