import { systemCardHeader } from '@/data'

import { SystemCardContents } from './Contents'
import { SystemCardEvaluation, SystemCardProduct, SystemCardScope, SystemCardSpec, SystemCardStories } from './Sections'

/**
 * The System Card (moved from danbenner.com/tamago.html, 2026-11-23): its own page, system-card.html, in the
 * dashboard's repo and styling but not part of the metrics dashboard (no sidebar, no snapshot banner). How Tamago was
 * built and checked, in five numbered sections; reference text from src/data/system-card.json.
 */
export function SystemCardPage() {
  return (
    <div className="min-h-svh bg-background text-foreground">
      <div className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-20 px-4 py-8 lg:gap-28 sm:px-6 lg:px-8 lg:py-12">
        <header className="flex min-w-0 flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}tamago-sushi.webp`} alt="" width={384} height={256} className="block h-auto w-9" />
            <p className="text-sm font-semibold tracking-tight">Tamago</p>
          </div>
          <div className="flex max-w-3xl flex-col gap-2">
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{systemCardHeader.title}</h1>
            <p className="text-base text-muted-foreground">{systemCardHeader.subtitle}</p>
          </div>
          <SystemCardContents />
        </header>
        <SystemCardStories />
        <SystemCardProduct />
        <SystemCardScope />
        <SystemCardSpec />
        <SystemCardEvaluation />
      </div>
    </div>
  )
}
