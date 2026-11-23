import type { ReactNode } from 'react'

import { cefrGroups, cefrHeader } from '@/data'
import { CefrGroupChip } from '@/layout/CefrGroupChip'
import { CefrLadder } from '@/layout/CefrLadder'
import { CefrSources } from '@/layout/CefrSources'
import { CefrToday } from '@/layout/CefrToday'
import { PageFrame, PageSection } from '@/layout/PageFrame'

interface CefrPageProps {
  /** "Same level, different distance": the FSI bar chart, in its own Card. */
  distance: ReactNode
  /** "How big is each level?": the vocabulary card. */
  vocabulary: ReactNode
  /** The exams grid, in its own Card. */
  exams: ReactNode
}

/**
 * The CEFR page: what the scale is (the header, with the three group chips), the six levels, how long each language
 * takes, how many words a level means, the real exams, then where Tamago's courses sit today, and the sources.
 */
export function CefrPage({ distance, vocabulary, exams }: CefrPageProps) {
  return (
    <PageFrame
      title={cefrHeader.title}
      description={cefrHeader.subtitle}
      notice={
        <div className="flex flex-col gap-2">
          <ul aria-label="CEFR groups" className="flex flex-wrap gap-2">
            {cefrGroups.map((group) => (
              <li key={group.id}>
                <CefrGroupChip group={group.id} label={group.name} detail={group.levels.join(', ')} />
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">{cefrHeader.fact}</p>
        </div>
      }
    >
      <PageSection label="The Six Levels">
        <CefrLadder />
      </PageSection>
      <PageSection label="Same Level, Different Distance">{distance}</PageSection>
      <PageSection label="How Big Is Each Level">{vocabulary}</PageSection>
      <PageSection label="The Real Exams">{exams}</PageSection>
      <PageSection label="Tamago Today">
        <CefrToday />
      </PageSection>
      <CefrSources />
    </PageFrame>
  )
}
