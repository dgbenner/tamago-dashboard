// TEMPORARY (Dan, 2026-11-24): six takes on section 03's Goal box in the Tamago app's style (rounded-2xl, 2 px
// borders, its yellow, green and ink), stacked full width so each can be judged in place. Dan picks one; the rest go.

const CAPS = 'text-[11px] font-bold tracking-[0.1em] uppercase'

function Option({ n, name, children }: { n: number; name: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">Option {n}</span> · {name}
      </p>
      {children}
    </div>
  )
}

export function GoalOptions({ label, goal }: { label: string; goal: string }) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl border-2 border-dashed border-border p-5">
      <Option n={1} name="Yellow bar on the left">
        <div className="rounded-2xl border-2 border-border border-l-[6px] border-l-tamago-yellow bg-card px-5 py-4">
          <p className={`${CAPS} text-muted-foreground`}>{label}</p>
          <p className="mt-1 text-lg font-semibold">{goal}</p>
        </div>
      </Option>

      <Option n={2} name="Solid Tamago yellow, like the app’s main button">
        <div className="rounded-2xl bg-tamago-yellow px-5 py-4 text-tamago-ink">
          <p className={`${CAPS} text-tamago-ink/70`}>{label}</p>
          <p className="mt-1 text-lg font-semibold">{goal}</p>
        </div>
      </Option>

      <Option n={3} name="Reversed out, yellow label">
        <div className="rounded-2xl bg-tamago-ink px-5 py-4 text-white">
          <p className={`${CAPS} text-tamago-yellow`}>{label}</p>
          <p className="mt-1 text-lg font-semibold">{goal}</p>
        </div>
      </Option>

      <Option n={4} name="Sushi mark beside the line">
        <div className="flex items-center gap-4 rounded-2xl border-2 border-border bg-card px-5 py-4">
          <img src={`${import.meta.env.BASE_URL}tamago-sushi.webp`} alt="" width={384} height={256} className="block h-auto w-12 shrink-0" />
          <div>
            <p className={`${CAPS} text-muted-foreground`}>{label}</p>
            <p className="mt-1 text-lg font-semibold">{goal}</p>
          </div>
        </div>
      </Option>

      <Option n={5} name="No box: a large line with a yellow marker">
        <div className="py-1">
          <p className={`${CAPS} text-muted-foreground`}>{label}</p>
          <p className="mt-2 text-2xl leading-snug font-semibold">
            <span className="box-decoration-clone bg-[linear-gradient(transparent_55%,var(--tamago-yellow)_55%)] px-1">{goal}</span>
          </p>
        </div>
      </Option>

      <Option n={6} name="Green label and rule, Tamago’s green">
        <div className="rounded-2xl border-2 border-tamago-green/40 bg-tamago-green/5 px-5 py-4">
          <p className={`${CAPS} flex items-center gap-2 text-tamago-green`}>
            <span aria-hidden="true" className="size-2 rounded-full bg-tamago-green" />
            {label}
          </p>
          <p className="mt-1 text-lg font-semibold">{goal}</p>
        </div>
      </Option>
    </div>
  )
}
