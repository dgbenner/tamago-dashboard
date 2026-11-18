/**
 * One row of a chart tooltip: a color key, the series name and its formatted value. Used as the
 * `formatter` output of `ChartTooltipContent`, so every chart's tooltip reads the same way. The
 * color sits only in the key; the name and value stay in text tokens.
 */
export function TooltipRow({ color, name, value }: { color?: string; name: string; value: string }) {
  return (
    <div className="flex flex-1 items-center gap-2 leading-none">
      <span
        aria-hidden="true"
        className="size-2.5 shrink-0 rounded-[2px]"
        style={{ backgroundColor: color }}
      />
      <span className="text-muted-foreground">{name}</span>
      <span className="ml-auto pl-4 font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

/** The tooltip heading: the hovered row's own date, read from the row rather than the axis label. */
export function rowDate(payload: ReadonlyArray<{ payload?: unknown }> | undefined): string | undefined {
  const row = payload?.[0]?.payload as { date?: string } | undefined
  return row?.date
}
