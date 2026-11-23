import { cefrSources } from '@/data'

/** The page's sources, small and linked, at the foot of the CEFR page. Each opens in a new tab. */
export function CefrSources() {
  return (
    <footer aria-label={cefrSources.title} className="flex flex-col gap-2 border-t pt-4 text-xs text-muted-foreground">
      <h2 className="text-sm font-medium text-foreground">{cefrSources.title}</h2>
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
    </footer>
  )
}
