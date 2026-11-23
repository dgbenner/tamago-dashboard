import type { ReactNode } from 'react'

import { cefrHeader } from '@/data'
import { CefrLadder } from '@/layout/CefrLadder'
import { CefrSkills } from '@/layout/CefrSkills'
import { CefrSources } from '@/layout/CefrSources'
import { CefrToday } from '@/layout/CefrToday'
import { PageFrame, PageSection } from '@/layout/PageFrame'

interface CefrPageProps {
  /** "Same level, different distance": the FSI bar chart, in its own Card. */
  distance: ReactNode
  /** The exams grid, in its own Card. */
  exams: ReactNode
}

/**
 * The CEFR page: what the scale is (the header), the six levels, the skills they measure, how long each language
 * takes, the real exams, then where Tamago's courses sit today, and the sources.
 */
export function CefrPage({ distance, exams }: CefrPageProps) {
  return (
    <PageFrame
      title={cefrHeader.title}
      description={cefrHeader.subtitle}
      spacious
    >
      <PageSection label="The Six Levels">
        <CefrLadder />
      </PageSection>
      <PageSection label="What Each Level Measures">
        <div className="py-4">
          <CefrSkills />
        </div>
      </PageSection>
      <PageSection label="Same Level, Different Distance">{distance}</PageSection>
      <PageSection label="The Real Exams">{exams}</PageSection>
      <PageSection label="Tamago Currently">
        <CefrToday />
      </PageSection>
      <CefrSources />
    </PageFrame>
  )
}
