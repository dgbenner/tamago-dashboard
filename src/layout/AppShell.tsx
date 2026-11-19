import { useEffect, useRef, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { snapshotLabel, snapshotTakenAt } from '@/data'

import { NAV_ITEMS, isRealPage, pageHref, type PageId } from './nav'

/**
 * The app shell. At lg and up: a fixed-width sidebar on the left, content on the right.
 * Below lg: the sidebar becomes a compact top bar (product name and the nav links in one row,
 * which scrolls sideways inside the bar when it runs out of room), content below.
 *
 * A banner runs across the full width above everything: a quiet line naming the snapshot on a page of
 * real data, the red warning on a placeholder page. The shell fills the window and only the content
 * area scrolls, so the banner (and the sidebar or top bar) always stay in view.
 */
export function AppShell({
  current = 'content-health',
  children,
}: {
  current?: PageId
  children: ReactNode
}) {
  const navRef = useRef<HTMLElement>(null)
  const mainRef = useRef<HTMLElement>(null)

  // A newly opened page starts at its top.
  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [current])

  // In the narrow top bar the nav row scrolls sideways; keep the current item in view.
  useEffect(() => {
    navRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ inline: 'nearest', block: 'nearest' })
  }, [current])

  return (
    <div className="flex h-dvh w-full flex-col bg-background text-foreground">
      {isRealPage(current) ? (
        <div
          role="note"
          data-banner="real"
          className="shrink-0 bg-linear-to-r from-tamago-yellow to-tamago-green px-4 py-1.5 text-center text-xs font-medium text-tamago-ink"
        >
          <p>
            Real data, snapshot from <time dateTime={snapshotTakenAt}>{snapshotLabel}</time>
          </p>
        </div>
      ) : (
        // Same colors as the destructive Badge, the library's warning style.
        <div
          role="note"
          aria-label="Warning"
          data-banner="placeholder"
          className="flex shrink-0 items-center justify-center gap-2 bg-destructive px-4 py-2 text-center text-sm font-semibold text-white dark:bg-destructive/60"
        >
          <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
          <p>Placeholder numbers. Nothing on this page is real data yet.</p>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
      <aside
        className={
          'flex min-w-0 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar px-4 py-2 text-sidebar-foreground ' +
          'lg:w-60 lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-visible lg:border-r lg:border-b-0 lg:px-3 lg:py-4'
        }
      >
        {/* The product lockup. Narrow: a small sushi to the left of the name, on one line.
            Wide: the name with the sushi centred under it, as on the Tamago app's loading screen. */}
        <div className="flex shrink-0 items-center gap-2 lg:flex-col-reverse lg:gap-1.5 lg:px-3">
          {/* Wide screens: every 10 seconds the sushi rocks, crouches, hops off the top of the screen for about
              1.5 s and lands again, while its shadow fades and shrinks and comes back (index.css .sushi-*).
              Three wrappers so each motion keeps its own pivot: fly moves it, rock pivots on the bottom centre,
              land squashes from the top centre. Still under reduced motion and on phones. */}
          <span className="sushi-mark relative flex shrink-0 flex-col items-center">
            <span className="sushi-fly relative z-50 block">
              <span className="sushi-rock block">
                <span className="sushi-land block">
                  <img
                    src={`${import.meta.env.BASE_URL}tamago-sushi.webp`}
                    alt=""
                    width={384}
                    height={256}
                    className="block h-auto w-7 lg:w-15"
                  />
                </span>
              </span>
            </span>
            <span className="sushi-shadow pointer-events-none absolute bottom-0 left-1/2 hidden h-2 w-[70%] lg:block" aria-hidden="true" />
          </span>
          <p className="whitespace-nowrap text-sm font-semibold tracking-tight lg:text-base">Tamago Metrics</p>
        </div>

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
              variant="ghost"
              size="sm"
              // The current page (Dan, 2026-11-19): a light Tamago-yellow fill, so it reads at a glance; the others stay plain.
              className={
                'shrink-0 whitespace-nowrap lg:w-full lg:justify-start ' +
                (id === current ? 'bg-tamago-yellow/25 font-semibold hover:bg-tamago-yellow/35' : '')
              }
            >
              <a href={pageHref(id)} aria-current={id === current ? 'page' : undefined}>
                <Icon className="hidden lg:block" aria-hidden="true" />
                {label}
              </a>
            </Button>
          ))}
        </nav>
      </aside>

      <main ref={mainRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto">
        {children}
      </main>
      </div>
    </div>
  )
}
