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
3. **No network calls.** Everything a page shows comes from `src/data/`.
4. **Every number on a page comes from the data files**, never typed into a page. This includes
   counts, percentages, dates and totals. Derived numbers (an average, a sum) are computed from the
   data, in code.

## Real data and placeholders

- Content Health, Content Growth, System Health and Agent Activity show **real** numbers from `src/data/snapshot.json`,
  and CEFR (reference text in `src/data/cefr.json`) takes its Tamago badge, word range and Today chips from it;
  written by `npm run snapshot` (`scripts/snapshot.mjs`, owned by the coordinator). Cost is a placeholder with mock data.
- `snapshot.json` and `snapshot-history.json` are generated. Nobody edits them by hand, the `data` agent included.
- **Never invent or estimate a number.** An empty value in the snapshot reaches the page as "Not measured yet"
  (or "Not recorded"), never as 0.
- Counts only: no sentence text, nothing from Tamago's `_review/` files, no personal details.
- The snapshot reads a clean copy of the pushed Tamago repo kept in `.cache/` and the GitHub API. Nothing in this
  project reads or writes `~/Sites/tamago`.
- A trend line is drawn only when the history holds two or more snapshots.
- A real page carries the quiet line "Real data, snapshot from …" and no "Sample Data" badge. A placeholder page
  carries the red banner and the badge.

## Working here

- The dev server is usually already running (`npm run dev`) and reloads the page on every save.
  Don't start a second one and don't restart it.
- Don't edit files in `src/components/ui/`. They are the library.
- Colors come from the theme tokens in `src/index.css`. Don't write hex or oklch values in pages.
- Check your work with `npx tsc -b`. Don't run `npm run build` while the dev server is in use unless
  asked.
