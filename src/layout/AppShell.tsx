import { useEffect, useRef, type ReactNode } from 'react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { NAV_ITEMS, pageHref, type PageId } from './nav'

/**
 * The app shell. At lg and up: a fixed-width sidebar on the left, content on the right.
 * Below lg: the sidebar becomes a compact top bar (product name and the nav links in one row,
 * which scrolls sideways inside the bar when it runs out of room), content below.
 */
export function AppShell({
  current = 'content-health',
  children,
}: {
  current?: PageId
  children: ReactNode
}) {
  const navRef = useRef<HTMLElement>(null)

  // In the narrow top bar the nav row scrolls sideways; keep the current item in view.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [current])

  return (
    <div className="flex min-h-svh w-full flex-col bg-background text-foreground lg:flex-row">
      <aside
        className={
          'sticky top-0 z-10 flex min-w-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 py-2 text-sidebar-foreground ' +
          'lg:h-svh lg:w-60 lg:shrink-0 lg:flex-col lg:items-stretch lg:gap-0 lg:border-r lg:border-b-0 lg:px-3 lg:py-4'
        }
      >
        <p className="shrink-0 text-sm font-semibold tracking-tight lg:px-3 lg:text-base">Tamago</p>

        <Separator orientation="vertical" className="data-[orientation=vertical]:h-5 lg:hidden" />
        <Separator className="my-3 hidden lg:block" />

        <nav
          ref={navRef}
          aria-label="Main"
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto p-1 lg:flex-none lg:flex-col lg:items-stretch lg:overflow-visible lg:p-0"
        >
          {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
            <Button
              key={id}
              asChild
              variant={id === current ? 'secondary' : 'ghost'}
              size="sm"
              className="shrink-0 whitespace-nowrap lg:w-full lg:justify-start"
            >
              <a href={pageHref(id)} aria-current={id === current ? 'page' : undefined}>
                <Icon className="hidden lg:block" aria-hidden="true" />
                {label}
              </a>
            </Button>
          ))}
        </nav>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  )
}
