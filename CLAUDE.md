# Builder trial

A trial of several specialist agents building pages at the same time from one component library, with
the page updating live in the browser. The full spec is `SPEC-dashboard-builder-trial.md`. This project
is not connected to the Tamago repo.

Stack: Vite, React, TypeScript, Tailwind v4, shadcn/ui components, Recharts. Imports use the `@/` alias
for `src/`.

## Rules

1. **Build only from components in `COMPONENTS.md`.** If something is missing, stop and propose a new
   component (its name, what it's for, its props). Don't invent one inside a page. Plain layout
   elements (`div`, `main`, `nav`, `section`, headings, paragraphs) with Tailwind classes are fine;
   anything that acts as a control or a styled widget must be a library component.
2. **Each agent writes only in its own folder**, so agents working at the same time never edit the
   same file.

   | Agent | Owns |
   | --- | --- |
   | `data` | `src/data/` |
   | `layout` | `src/layout/`, `src/pages/` |
   | `tables` | `src/tables/` |
   | `charts` | `src/charts/` |

   The main session (the coordinator) owns everything else: `src/App.tsx`, `src/main.tsx`,
   `src/index.css`, `src/components/ui/`, config files and these docs. Agents may read any file.
3. **No real data and no network calls.** Everything comes from `src/data/`.
4. **Every number on a page comes from the data files**, never typed into a page. This includes
   counts, percentages, dates and totals. Derived numbers (an average, a sum) are computed from the
   data, in code.

## Working here

- The dev server is usually already running (`npm run dev`) and reloads the page on every save.
  Don't start a second one and don't restart it.
- Don't edit files in `src/components/ui/`. They are the library.
- Colors come from the theme tokens in `src/index.css`. Don't write hex or oklch values in pages.
- Check your work with `npx tsc -b`. Don't run `npm run build` while the dev server is in use unless
  asked.
