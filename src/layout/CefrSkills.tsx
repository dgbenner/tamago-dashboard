import { BookOpen, Ear, Languages, MessagesSquare, Mic, PenLine, type LucideIcon } from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { cefrSkills, type CefrSkillId } from '@/data'

import { CefrSection } from './CefrSection'

const SKILL_ICON: Record<CefrSkillId, LucideIcon> = {
  listening: Ear,
  reading: BookOpen,
  interaction: MessagesSquare,
  production: Mic,
  writing: PenLine,
  mediation: Languages,
}

/** The CEFR skills each level is described in: a small row of cards, an icon, the name and one line each. */
export function CefrSkills() {
  return (
    <CefrSection title={cefrSkills.title} intro={cefrSkills.intro}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {cefrSkills.items.map((skill) => {
          const Icon = SKILL_ICON[skill.id]
          return (
            <li key={skill.id} className="min-w-0">
              <Card className="h-full border-transparent bg-cefr-skill py-3 text-white">
                <CardContent className="flex flex-col gap-1 px-4">
                  <Icon aria-hidden="true" className="mb-1 size-4 text-white" />
                  <p className="text-sm font-medium">{skill.name}</p>
                  <p className="text-xs text-white/80">{skill.line}</p>
                  {skill.note ? <p className="text-[11px] text-white/70 italic">{skill.note}</p> : null}
                </CardContent>
              </Card>
            </li>
          )
        })}
      </ul>
    </CefrSection>
  )
}
