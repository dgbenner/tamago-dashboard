import { lazy, Suspense, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { systemCardGate } from '@/data'

const DocReader = lazy(() => import('./DocReader'))

// A courtesy door, not security: the page and the Tamago repo are public. Asked once per browser.
const KEY = 'tamago-system-card-open'
let openedNow = false
function isOpen() {
  try { return openedNow || localStorage.getItem(KEY) === 'yes' } catch { return openedNow }
}
function remember() {
  openedNow = true
  try { localStorage.setItem(KEY, 'yes') } catch { /* private window: lasts until the page closes */ }
}

/** A blue underlined link that opens a file in a window on the page, behind the password the first time. */
export function DocLink({ id, title, label, className = '' }: { id: string; title: string; label: string; className?: string }) {
  const [open, setOpen] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [typed, setTyped] = useState('')
  const [wrong, setWrong] = useState(false)
  const submit = () => {
    if (typed.trim() !== systemCardGate.password) return setWrong(true)
    remember()
    setAllowed(true)
  }
  return (
    <>
      <Button
        variant="link"
        aria-haspopup="dialog"
        className={`h-auto! justify-start p-0! text-left text-link! underline whitespace-normal! cursor-pointer hover:text-foreground! ${className}`}
        onClick={() => { setAllowed(isOpen()); setTyped(''); setWrong(false); setOpen(true) }}
      >
        {label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        {allowed ? (
          <DialogContent className="h-[92dvh] w-[calc(100vw-1.5rem)] max-w-7xl overflow-hidden">
            <Suspense fallback={<div className="p-5"><DialogTitle>{title}</DialogTitle><DialogDescription>{label}</DialogDescription></div>}>
              <DocReader id={id} title={title} />
            </Suspense>
          </DialogContent>
        ) : (
          <DialogContent className="w-[calc(100vw-2rem)] max-w-sm p-6">
            <DialogTitle>{systemCardGate.title}</DialogTitle>
            <DialogDescription className="mt-1">{systemCardGate.text}</DialogDescription>
            <div className="mt-4 flex">
              <Input
                type="text"
                className="rounded-r-none! border-r-0! focus-visible:z-10"
                inputMode="numeric"
                autoComplete="off"
                aria-label={systemCardGate.title}
                aria-invalid={wrong || undefined}
                value={typed}
                onChange={(e) => { setTyped(e.target.value); setWrong(false) }}
                onKeyDown={(e) => { if (e.key === 'Enter') submit() }}
              />
              <Button className="rounded-l-none!" onClick={submit}>{systemCardGate.button}</Button>
            </div>
            <p role="status" className="mt-2 min-h-5 text-sm text-destructive">{wrong ? systemCardGate.wrong : ''}</p>
          </DialogContent>
        )}
      </Dialog>
    </>
  )
}
