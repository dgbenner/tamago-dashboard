import { Badge } from '@/components/ui/badge'
import type { CefrGroupId } from '@/data'

/** Each CEFR group's fill: dark enough for white text (see the --cefr-* tokens in src/index.css). */
const GROUP_FILL: Record<CefrGroupId, string> = {
  basic: 'bg-cefr-basic',
  independent: 'bg-cefr-independent',
  proficient: 'bg-cefr-proficient',
}

/** The darker fold under a ribbon, drawn as a small triangle with a border: only its top border is colored. */
const GROUP_FOLD: Record<CefrGroupId, string> = {
  basic: 'border-t-cefr-basic-fold',
  independent: 'border-t-cefr-independent-fold',
  proficient: 'border-t-cefr-proficient-fold',
}

/** A chip naming a CEFR group (Basic, Independent, Proficient): white text on the group's color, no outline. */
export function CefrGroupChip({ group, label, className = '' }: { group: CefrGroupId; label: string; className?: string }) {
  return <Badge className={`border-transparent text-white ${GROUP_FILL[group]} ${className}`}>{label}</Badge>
}

/**
 * The group chip as a ribbon: square on the right, running `overhang` pixels past the card's right edge, with a darker
 * triangle under that end, so it reads as wrapping behind the card. Place it where its right edge meets the card's
 * edge plus the overhang (the caller sets the margin).
 */
export function CefrGroupRibbon({ group, label, className = '' }: { group: CefrGroupId; label: string; className?: string }) {
  return (
    <span className={`relative inline-flex ${className}`}>
      <CefrGroupChip group={group} label={label} className="rounded-r-none rounded-l-sm" />
      <span
        aria-hidden="true"
        className={`absolute top-full right-0 size-0 border-t-[6px] border-r-[6px] border-r-transparent ${GROUP_FOLD[group]}`}
      />
    </span>
  )
}
