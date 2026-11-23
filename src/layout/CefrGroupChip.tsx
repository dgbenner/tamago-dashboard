import { Badge } from '@/components/ui/badge'
import type { CefrGroupId } from '@/data'

/** Each CEFR group's color, as a dot beside its name. The dot carries the color; the text stays in text tokens. */
const GROUP_DOT: Record<CefrGroupId, string> = {
  basic: 'bg-chart-3',
  independent: 'bg-chart-1',
  proficient: 'bg-chart-5',
}

/** A chip naming a CEFR group (Basic, Independent, Proficient) in its color. `detail` adds its levels, e.g. "A1, A2". */
export function CefrGroupChip({ group, label, detail }: { group: CefrGroupId; label: string; detail?: string }) {
  return (
    <Badge variant="outline" className="gap-1.5">
      <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${GROUP_DOT[group]}`} />
      <span>{label}</span>
      {detail ? <span className="font-normal text-muted-foreground">{detail}</span> : null}
    </Badge>
  )
}
