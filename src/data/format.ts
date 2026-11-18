// Every formatter pages need, so no page formats a number or a date itself.

import { toUtcDate } from './internal'
import type { IsoDate, IsoDateTime } from './types'

const countFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 })
const percentFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 })
const percent2Format = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const currencyFormat = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })
const oneDecimalFormat = new Intl.NumberFormat('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })

/** A whole number with thousands separators, e.g. 2179 → "2,179". */
export function formatCount(value: number): string {
  return countFormat.format(value)
}

/** A whole number that is a change, with its sign, e.g. 8 → "+8", 0 → "0", -2 → "−2". */
export function formatDelta(value: number): string {
  if (value > 0) return `+${formatCount(value)}`
  if (value < 0) return `−${formatCount(-value)}`
  return formatCount(0)
}

/** A 0–100 value as a percent with at most one decimal, e.g. 71 → "71%", 70.3 → "70.3%". */
export function formatPercent(value: number): string {
  return `${percentFormat.format(value)}%`
}

/** A 0–100 value as a percent with exactly two decimals, e.g. 99.916 → "99.92%". For uptime. */
export function formatUptime(value: number): string {
  return `${percent2Format.format(value)}%`
}

/** US dollars with cents, e.g. 1234.56 → "$1,234.56", 0.9 → "$0.90". */
export function formatCurrency(value: number): string {
  return currencyFormat.format(value)
}

/** A compact token count, e.g. 48_213_000 → "48.2M", 950_400 → "950K", 812 → "812". */
export function formatTokens(value: number): string {
  if (value >= 999_950_000) return `${oneDecimalFormat.format(value / 1_000_000_000)}B`
  if (value >= 999_500) return `${oneDecimalFormat.format(value / 1_000_000)}M`
  if (value >= 1_000) return `${countFormat.format(value / 1_000)}K`
  return countFormat.format(value)
}

/** Milliseconds, rounded, e.g. 142.4 → "142 ms". */
export function formatMs(value: number): string {
  return `${countFormat.format(value)} ms`
}

/** Seconds as a duration, e.g. 252 → "4m 12s", 45 → "45s", 3900 → "1h 5m". */
export function formatDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${m}m`
  if (m > 0) return `${m}m ${s}s`
  return `${s}s`
}

const longDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
const shortDateFormat = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })

/** 'YYYY-MM-DD' → "Nov 16, 2026". The same in every time zone. */
export function formatDate(date: IsoDate): string {
  return longDateFormat.format(toUtcDate(date))
}

/** 'YYYY-MM-DD' → "Nov 16". For chart axes, tooltips and tight table cells. */
export function formatShortDate(date: IsoDate): string {
  return shortDateFormat.format(toUtcDate(date))
}

/** 'YYYY-MM-DDTHH:mm:ss' → "2:05 PM". Reads the digits as written, so no time zone is involved. */
export function formatTime(dateTime: IsoDateTime): string {
  const [hours, minutes] = dateTime.slice(11, 16).split(':').map(Number)
  const hour12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${hours < 12 ? 'AM' : 'PM'}`
}

/** 'YYYY-MM-DDTHH:mm:ss' → "Nov 17, 2:05 PM". The same in every time zone. */
export function formatDateTime(dateTime: IsoDateTime): string {
  return `${formatShortDate(dateTime.slice(0, 10))}, ${formatTime(dateTime)}`
}
