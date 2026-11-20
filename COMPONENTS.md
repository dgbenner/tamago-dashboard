# Components

The complete component library for this project. Pages and sections are built only from what is listed
here. If you need something that isn't listed, stop and propose it (see `CLAUDE.md`).

- All components live in `src/components/ui/` and are imported as `@/components/ui/<file>`.
- Source: shadcn/ui (new-york style, Radix primitives, MIT) and Recharts 3 (MIT).
- Every component accepts `className` and the props of the HTML element it renders.
- Icons come from `lucide-react`, which the components already use. Use it for icons only.
- Colors come from theme tokens (`bg-muted`, `text-muted-foreground`, `border`, `text-destructive`).
  Don't write hex or oklch values in pages.
- Chart colors: `var(--chart-1)` to `var(--chart-6)` are six distinct hues (blue, orange, aqua, yellow,
  magenta, green). Give them to series in that fixed order, and keep the same color for the same
  thing (a language, an agent) on every chart. A chart with one series uses `var(--chart-1)`.
  Sparklines use `var(--chart-neutral)` (grey).
- `TooltipProvider` already wraps the app in `src/main.tsx`. Don't add another.

| Component | File | Use it for |
| --- | --- | --- |
| [Card](#card) | `card.tsx` | A bordered container for one section of a page |
| [Table](#table) | `table.tsx` | Rows of data |
| [Badge](#badge) | `badge.tsx` | A short status label |
| [Tabs](#tabs) | `tabs.tsx` | Switching between views in the same place |
| [Button](#button) | `button.tsx` | Any clickable action |
| [Input](#input) | `input.tsx` | One line of typed text |
| [Select](#select) | `select.tsx` | Choosing one option from a list |
| [Separator](#separator) | `separator.tsx` | A thin dividing line |
| [Tooltip](#tooltip) | `tooltip.tsx` | A short explanation on hover or focus |
| [Alert](#alert) | `alert.tsx` | A banner that calls out something missing or wrong |
| [Chart](#chart) | `chart.tsx` | The wrapper around every Recharts chart |

---

## Card

**File:** `src/components/ui/card.tsx`
**Exports:** `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
**For:** a bordered container for one section: a stat, a table, a chart.
**Main props:** none beyond `className`. `CardAction` goes inside `CardHeader` and sits at its top right.

```tsx
<Card>
  <CardHeader>
    <CardTitle>Drafts waiting</CardTitle>
    <CardDescription>For a native speaker</CardDescription>
  </CardHeader>
  <CardContent>{stats.draftsWaiting}</CardContent>
</Card>
```

## Table

**File:** `src/components/ui/table.tsx`
**Exports:** `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`
**For:** rows of data. `Table` scrolls sideways by itself when it is wider than its container.
**Main props:** none beyond `className`. `TableHead` is a `<th>`, `TableCell` a `<td>`. There is no
built-in sorting: for a sortable column, put a `Button variant="ghost"` inside the `TableHead`, keep the
sort state in the table component, and set `aria-sort` on the `TableHead`.

```tsx
<Table>
  <TableHeader>
    <TableRow><TableHead>Language</TableHead><TableHead>Circles</TableHead></TableRow>
  </TableHeader>
  <TableBody>
    {rows.map((r) => (
      <TableRow key={r.id}><TableCell>{r.name}</TableCell><TableCell>{r.circles}</TableCell></TableRow>
    ))}
  </TableBody>
</Table>
```

## Badge

**File:** `src/components/ui/badge.tsx`
**Exports:** `Badge`, `badgeVariants`
**For:** a short status label, such as Complete, In progress, Live or Blocked.
**Main props:** `variant`: `"default"` (solid) | `"secondary"` | `"destructive"` | `"outline"` |
`"ghost"` | `"link"`. `asChild` renders the badge as its child element, for example a link.

```tsx
<Badge variant={row.status === 'complete' ? 'default' : 'secondary'}>
  {row.statusLabel}
</Badge>
<Badge variant="destructive">Blocked</Badge>
```

## Tabs

**File:** `src/components/ui/tabs.tsx`
**Exports:** `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
**For:** switching between views in the same place.
**Main props:** `Tabs`: `defaultValue`, or `value` with `onValueChange`; `orientation`:
`"horizontal"` | `"vertical"`. `TabsList`: `variant`: `"default"` (pill) | `"line"` (underline).
`TabsTrigger` and `TabsContent`: `value`, which must match.

```tsx
<Tabs defaultValue="languages">
  <TabsList>
    <TabsTrigger value="languages">Languages</TabsTrigger>
    <TabsTrigger value="deploys">Deploys</TabsTrigger>
  </TabsList>
  <TabsContent value="languages">…</TabsContent>
  <TabsContent value="deploys">…</TabsContent>
</Tabs>
```

## Button

**File:** `src/components/ui/button.tsx`
**Exports:** `Button`, `buttonVariants`
**For:** any clickable action, including sidebar items and sortable column headers.
**Main props:** `variant`: `"default"` | `"secondary"` | `"outline"` | `"ghost"` | `"destructive"` |
`"link"`. `size`: `"default"` | `"xs"` | `"sm"` | `"lg"` | `"icon"` | `"icon-xs"` | `"icon-sm"` |
`"icon-lg"`. `asChild` renders the button as its child element, for example an `<a>`. `disabled`.

```tsx
<Button variant="ghost" size="sm" onClick={() => toggleSort('circles')}>
  Circles
  <ArrowUpDown />
</Button>
```

## Input

**File:** `src/components/ui/input.tsx`
**Exports:** `Input`
**For:** one line of typed text, such as a filter box.
**Main props:** every `<input>` prop: `type`, `value`, `onChange`, `placeholder`, `disabled`.
Set `aria-invalid` to show the error style. Always give it a label or an `aria-label`.

```tsx
<Input
  aria-label="Filter languages"
  placeholder="Filter languages"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

## Select

**File:** `src/components/ui/select.tsx`
**Exports:** `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator`
**For:** choosing one option from a list.
**Main props:** `Select`: `value` with `onValueChange`, or `defaultValue`. `SelectTrigger`: `size`:
`"default"` | `"sm"`. `SelectValue`: `placeholder`. `SelectItem`: `value` (required, never an empty string).

```tsx
<Select value={branch} onValueChange={setBranch}>
  <SelectTrigger aria-label="Branch"><SelectValue placeholder="Branch" /></SelectTrigger>
  <SelectContent>
    {branches.map((b) => <SelectItem key={b} value={b}>{b}</SelectItem>)}
  </SelectContent>
</Select>
```

## Separator

**File:** `src/components/ui/separator.tsx`
**Exports:** `Separator`
**For:** a thin dividing line between groups.
**Main props:** `orientation`: `"horizontal"` (default) | `"vertical"`. A vertical separator needs a
parent with a height. `decorative` (default `true`) hides it from screen readers.

```tsx
<nav>
  <p>Tamago</p>
  <Separator className="my-2" />
  {items}
</nav>
```

## Tooltip

**File:** `src/components/ui/tooltip.tsx`
**Exports:** `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`
**For:** a short explanation shown on hover or keyboard focus. Not for anything the user must read.
**Main props:** `TooltipTrigger`: `asChild`, so the trigger is your own focusable element (use a
`Button`). `TooltipContent`: `side`: `"top"` | `"right"` | `"bottom"` | `"left"`; `sideOffset`.

```tsx
<Tooltip>
  <TooltipTrigger asChild>
    <Button variant="ghost" size="icon-xs" aria-label="What counts as a draft"><Info /></Button>
  </TooltipTrigger>
  <TooltipContent>A sentence written but not yet checked by a native speaker.</TooltipContent>
</Tooltip>
```

## Alert

**File:** `src/components/ui/alert.tsx`
**Exports:** `Alert`, `AlertTitle`, `AlertDescription`
**For:** a banner in the page that calls out something missing or wrong, such as a check that does not
exist yet. Not for the red placeholder banner at the top, which belongs to the shell.
**Main props:** `variant`: `"default"` | `"destructive"`. A warning uses the default variant with the
Tamago yellow tokens (`border-tamago-yellow bg-tamago-yellow/20`). An icon from `lucide-react` goes first.

```tsx
<Alert className="border-tamago-yellow bg-tamago-yellow/20">
  <TriangleAlert />
  <AlertDescription>Uptime needs a check that does not exist yet.</AlertDescription>
</Alert>
```

## Chart

**File:** `src/components/ui/chart.tsx`
**Exports:** `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, type `ChartConfig`
**For:** the wrapper around every chart, including sparklines. The chart itself is made of Recharts
parts imported from `recharts` (`LineChart`, `Line`, `AreaChart`, `Area`, `BarChart`, `Bar`, `BarStack`, `XAxis`,
`YAxis`, `CartesianGrid`). Recharts parts are allowed only inside a `ChartContainer`.
**Main props:** `ChartContainer`: `config` (required), a `ChartConfig` mapping each data key to a
`label` and a `color`; each color is then available as `var(--color-<key>)`. Its default shape is
16:9, so set a height with `className` (for example `aspect-auto h-10 w-full` for a sparkline).
`ChartTooltip`: `content={<ChartTooltipContent />}`. `ChartTooltipContent`: `indicator`:
`"dot"` | `"line"` | `"dashed"`; `hideLabel`; `hideIndicator`.

```tsx
const config = { value: { label: 'Drafts', color: 'var(--chart-neutral)' } } satisfies ChartConfig

<ChartContainer config={config} className="aspect-auto h-10 w-full">
  <LineChart data={series} accessibilityLayer>
    <ChartTooltip content={<ChartTooltipContent hideLabel />} />
    <Line dataKey="value" stroke="var(--color-value)" strokeWidth={2} dot={false} />
  </LineChart>
</ChartContainer>
```
