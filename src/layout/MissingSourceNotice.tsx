import { TriangleAlert } from 'lucide-react'
import type { ReactNode } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'

/** The yellow banner under a page's description for a number that has no source yet (System Health, Cost). */
export function MissingSourceNotice({ children }: { children: ReactNode }) {
  return (
    <Alert className="flex items-center justify-center gap-2 border-tamago-yellow bg-tamago-yellow/20 text-center [&>svg]:translate-y-0">
      <TriangleAlert aria-hidden="true" className="size-4 shrink-0 text-foreground" />
      <AlertDescription className="text-foreground">{children}</AlertDescription>
    </Alert>
  )
}
