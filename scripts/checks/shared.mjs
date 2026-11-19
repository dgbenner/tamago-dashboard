// Shared by the check scripts in this folder.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'

/** The project root (two folders up from scripts/checks). */
export const ROOT = path.resolve(import.meta.dirname, '../..')

/** The five pages, by the id used in the address (`#/growth`). */
export const PAGE_IDS = ['content-health', 'growth', 'health', 'agent-activity', 'cost']

/** Pages that show the real snapshot. The others are placeholders and must say so. */
export const REAL_PAGES = ['content-health', 'health', 'agent-activity']

/**
 * Pages that need not have a chart. Health shows "Not measured yet" where its chart would be, and Content health has
 * trend lines only once the snapshot history holds two snapshots.
 */
export const PAGES_WITHOUT_CHART = ['health', 'content-health']

export const LOCAL_URL = 'http://localhost:5173/'
export const LIVE_URL = 'https://dgbenner.github.io/tamago-dashboard/'

/** The code the agents write: everything a page is made of, without the library or the data. */
const PAGE_CODE = ['src/layout', 'src/pages', 'src/tables', 'src/charts', 'src/App.tsx']

function walk(target) {
  const full = path.join(ROOT, target)
  if (statSync(full).isFile()) return [target]
  return readdirSync(full).flatMap((name) => walk(path.join(target, name)))
}

/** Every page-code file as `{ file, text, lines }`, with paths relative to the project root. */
export function pageCodeFiles() {
  return PAGE_CODE.flatMap(walk)
    .filter((file) => /\.tsx?$/.test(file))
    .sort()
    .map((file) => {
      const text = readFileSync(path.join(ROOT, file), 'utf8')
      return { file, text, lines: text.split('\n') }
    })
}

/** A base URL from the command line (`local`, `live`, or a full address). Defaults to local. */
export function baseUrl(arg, fallback = LOCAL_URL) {
  if (!arg) return fallback
  if (arg === 'local') return LOCAL_URL
  if (arg === 'live') return LIVE_URL
  return arg.endsWith('/') ? arg : arg + '/'
}
