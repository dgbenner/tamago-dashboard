import { Badge } from '@/components/ui/badge'
import type { CefrGroupId } from '@/data'

/** Each CEFR group's fill: dark enough for white text (see the --cefr-* tokens in src/index.css). */
const GROUP_FILL: Record<CefrGroupId, string> = {
  basic: 'bg-cefr-basic',
  independent: 'bg-cefr-independent',
  proficient: 'bg-cefr-proficient',
}

/** A chip naming a CEFR group (Basic, Independent, Proficient): white text on the group's color, no outline. */
export function CefrGroupChip({ group, label, className = '' }: { group: CefrGroupId; label: string; className?: string }) {
  return <Badge className={`border-transparent text-white ${GROUP_FILL[group]} ${className}`}>{label}</Badge>
}
