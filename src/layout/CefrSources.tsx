import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { cefrSources } from '@/data'

/** The page's sources at the foot of the CEFR page, in an accordion that starts closed. Each link opens in a new tab. */
export function CefrSources() {
  return (
    <footer aria-label={cefrSources.title} className="border-t">
      <Accordion type="single" collapsible>
        <AccordionItem value="sources" className="border-b-0">
          <AccordionTrigger className="flex-none items-center justify-start gap-1.5 [&>svg]:translate-y-0 text-sm">{cefrSources.title}</AccordionTrigger>
          <AccordionContent className="flex flex-col gap-2 text-xs text-muted-foreground">
            <ul className="flex flex-col gap-1">
              {cefrSources.links.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p>{cefrSources.exams}</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </footer>
  )
}
