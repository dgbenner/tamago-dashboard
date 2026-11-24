// What the System Card's links open: a plain-English summary written by hand (system-card-docs.json) beside the file as
// it is on GitHub (system-card-files.json, written by scripts/sync-card-files.mjs). Not in @/data's index: the reader
// imports it on its own, so the files load only when a link is opened.

import docsJson from './system-card-docs.json'
import filesJson from './system-card-files.json'

export interface CardDocSection {
  heading: string
  text: string
  /** Line of the file this section describes, from 0. */
  line: number
}
export interface CardDoc {
  file: string
  lines: string[]
  sections: CardDocSection[]
  /** Parts of the file the row is about, [start, end) in lines. */
  ranges: [number, number][]
}
interface RawDoc { file?: string; same?: string; sections?: string[][]; ranges?: (string | null)[][] }

const raw = docsJson.docs as Record<string, RawDoc>
const files = filesJson.files as Record<string, string>

export const cardReader = { summaryLabel: docsJson.summaryLabel, fileLabel: docsJson.fileLabel, commit: filesJson.commit, date: filesJson.date }

/** The line that is the mark, else the first that starts with it, else the first that contains it. */
function lineOf(lines: string[], mark: string): number {
  const trimmed = lines.map((l) => l.trim())
  for (const test of [(l: string) => l === mark, (l: string) => l.startsWith(mark), (l: string) => l.includes(mark)]) {
    const i = trimmed.findIndex(test)
    if (i >= 0) return i
  }
  throw new Error(`system-card-docs.json: "${mark}" is not in its file`)
}

export function cardDoc(id: string): CardDoc {
  const doc = raw[raw[id]?.same ?? id]
  if (!doc?.file || !doc.sections) throw new Error(`system-card-docs.json has no document "${id}"`)
  const lines = files[doc.file].replace(/\n$/, '').split('\n')
  return {
    file: doc.file,
    lines,
    sections: doc.sections.map(([heading, text, mark]) => ({ heading, text, line: lineOf(lines, mark) })),
    ranges: (doc.ranges ?? [[null, null]]).map(([from, to]) => [from ? lineOf(lines, from) : 0, to ? lineOf(lines, to) : lines.length]),
  }
}
