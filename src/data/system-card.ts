// The System Card page: reference text from system-card.json, moved from danbenner.com/tamago.html (2026-11-23).
// It is a dated account of how Tamago was built and checked, typed, not measured from the snapshot: the counts in it
// were taken from the repo on the date the spec section names. The spec total is summed here, not typed.

import cardJson from './system-card.json'
import { formatCount } from './format'
import { oneOf } from './internal'

export type EvalStatus = 'built' | 'progress' | 'planned'
const EVAL_STATUSES = ['built', 'progress', 'planned'] as const

export interface AgentStory {
  id: string
  name: string
  /** The table's heading when "The <name>’s agent story" doesn't read well. */
  heading?: string
  story: string
  may: string[]
  never: string[]
  decides: string[]
  stops: string[]
  works: string[]
}

export interface EvalRow {
  term: string
  artifact: string
  status: EvalStatus
  link: string | null
  href: string | null
}

export const systemCardHeader = cardJson.header

/** The contents list under the title: one entry per numbered section, label and number read from "01 · Agent Stories". */
export const systemCardContents = [cardJson.stories, cardJson.product, cardJson.scope, cardJson.spec, cardJson.evaluation].map((section) => {
  const [num, label] = section.label.split(' · ')
  return { id: section.id, num, label }
})
export const systemCardStories = { ...cardJson.stories, agents: cardJson.stories.agents as AgentStory[] }
export const systemCardProduct = cardJson.product
export const systemCardScope = cardJson.scope

/** The rows of an agent story, in the order the template names them. */
export const agentStoryElements: { key: keyof Omit<AgentStory, 'id' | 'name' | 'heading'>; label: string }[] = [
  { key: 'story', label: 'As / when / I want / so that' },
  { key: 'may', label: 'It may' },
  { key: 'never', label: 'It must never' },
  { key: 'decides', label: 'It decides' },
  { key: 'stops', label: 'It stops when' },
  { key: 'works', label: 'I’ll know it works when' },
]

const specTotal = cardJson.spec.rows.reduce((sum, row) => sum + row.words, 0)
export const systemCardSpec = {
  ...cardJson.spec,
  rows: cardJson.spec.rows.map((row) => ({ ...row, wordsLabel: formatCount(row.words) })),
  totalLabel: formatCount(specTotal),
  /** "About 13,000 words", rounded to the nearest thousand from the sum. */
  aboutLabel: `About ${formatCount(Math.round(specTotal / 1000) * 1000)} words`,
}

export const evalStatusLabels: Record<EvalStatus, string> = { built: 'Built', progress: 'In Progress', planned: 'Planned' }

export const systemCardEvaluation = {
  ...cardJson.evaluation,
  rows: cardJson.evaluation.rows.map(
    (row, i): EvalRow => ({ ...row, status: oneOf(EVAL_STATUSES, row.status, `system-card.json evaluation row ${i + 1} status`) }),
  ),
}
