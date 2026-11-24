import { Button } from '@/components/ui/button'
import { systemCardContents, systemCardHeader } from '@/data'

/**
 * "System Card Contents" (Dan, 2026-11-24): the layout and hover of the Case Study Contents on danbenner.com/stealth.html,
 * in the dashboard's own colors. Outlined pills in two columns (one on phones), the label left and the section number
 * right; on hover or keyboard focus a fill wipes in from the left (0.47 s, eased both ways) and the text turns over it.
 */
export function SystemCardContents() {
  return (
    <nav aria-label="Section navigation" className="max-w-[520px]">
      <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-muted-foreground uppercase">{systemCardHeader.contentsTitle}</p>
      <ol className="columns-1 gap-[18px] sm:columns-2">
        {systemCardContents.map((entry) => (
          <li key={entry.id} className="mb-[9px] break-inside-avoid">
            <Button
              asChild
              variant="outline"
              className="relative h-auto w-full justify-between gap-3.5 overflow-hidden rounded-full border-border py-[7px] pr-2 pl-[18px] text-[12.5px] leading-tight font-medium shadow-none transition-[color,border-color] duration-[470ms] ease-out before:absolute before:-inset-px before:origin-left before:scale-x-0 before:bg-foreground before:opacity-0 before:transition-[scale,opacity] before:duration-[470ms] before:ease-[cubic-bezier(0.45,0,0.25,1)] before:content-[''] hover:border-foreground hover:bg-background hover:text-background hover:before:scale-x-100 hover:before:opacity-100 focus-visible:border-foreground focus-visible:text-background focus-visible:before:scale-x-100 focus-visible:before:opacity-100 dark:bg-background dark:hover:bg-background"
            >
              <a href={`#${entry.id}`}>
                <span className="relative z-10 truncate">{entry.label}</span>
                <span className="relative z-10 w-6 text-center text-sm text-muted-foreground transition-colors duration-[470ms] [a:hover_&]:text-background/70 [a:focus-visible_&]:text-background/70">{entry.num}</span>
              </a>
            </Button>
          </li>
        ))}
      </ol>
    </nav>
  )
}
