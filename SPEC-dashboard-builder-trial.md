# Spec: Multi-agent page builder (trial)

For Claude Code, in a **new folder**, `~/Sites/builder-trial`. A small trial of the setup from the Reliqio
demo: several specialist agents build pages at the same time from a real component library, while Dan
watches the page update live in the browser. Not connected to the Tamago repo.

## What the demo is doing

- **A component library.** The agents may only build from existing components, so the result looks like
  one product instead of something invented each time.
- **A page spec.** What each page shows and who it's for.
- **Specialist agents.** In the demo: one for charts, one for tables, one for data, one for assets, and a
  main agent coordinating. Each one owns a different part of the page.
- **A live preview.** The page reloads every time an agent saves a file, so the page seems to draw itself.
  The colored cursors in the video are most likely a visualization added for the demo; the agents are
  writing code files.
- **A person reviewing.** They still check every screen and fix things by hand.

## Setup (main agent does this first)

1. Create a Vite + React + TypeScript project with Tailwind.
2. Add the component library: shadcn/ui components (copied into the project, MIT license) and Recharts
   for charts (MIT). Install only these components: Card, Table, Badge, Tabs, Button, Input,
   Select, Separator, Tooltip, and shadcn's Chart wrapper.
3. Write `COMPONENTS.md`: one entry per component with its name, file, what it's for, its main props,
   and a 3–5 line usage example. This file is how the agents "connect" to the library.
4. Write `CLAUDE.md` with the rules below.
5. Start the dev server (`npm run dev`) and tell Dan the local address to open in Firefox, next to VS Code.

## Rules (in CLAUDE.md)

- Build only from components in `COMPONENTS.md`. If something is missing, stop and propose a new
  component; don't invent one inside a page.
- Each agent writes only in its own folder (below), so agents working at the same time never edit the
  same file.
- No real data and no network calls. Everything comes from `src/data/`.
- Every number on a page comes from the data files, never typed into a page.

## The agents

Create four subagents as files in `.claude/agents/`, each with a name, a one-line description, the
tools it may use, and the folder it owns:

| Agent | Owns | Job |
| --- | --- | --- |
| `data` | `src/data/` | Writes realistic mock data as typed JSON, plus the types |
| `layout` | `src/layout/`, `src/pages/` | Page shell, sidebar, header, and placing sections on each page |
| `tables` | `src/tables/` | Every table, with sorting and status badges |
| `charts` | `src/charts/` | Stat cards with sparklines, and any charts |

The main session is the coordinator: it reads the page spec, splits it into tasks, runs `data` first,
then `layout`, `tables` and `charts` at the same time, and assembles the page.

## The trial page: Tamago content health

A page for Dan, the only user, to see the state of Tamago's content at a glance. All data is mock data
shaped like Tamago's real content.

**Top row: four stat cards with a 14-day sparkline each**
- Languages live (6)
- A1 coverage on the main path, average across languages (%)
- Drafts waiting for a native speaker
- Failed checks in the last build

**Main table: one row per language**
Columns: Language, Status (Complete / In progress, as a badge), Circles, Sentences, A1 coverage %,
Drafts waiting, Candidates waiting for Fable, Last deploy (animal name and date).
Sortable by any column. French is Complete; Spanish, Italian, German, Portuguese and Dutch are In progress.

**Second table: last 10 deploys**
Columns: Animal name, Date, Branch, Checks passed (e.g. "203/204"), Result (Live / Blocked badge).

**Sidebar:** Tamago, then Content health (current), Deploys, Audits. Only Content health has a page.

## Live editing

While the dev server runs, Dan asks for changes in the Claude Code panel by naming the component and
place, for example: "In the Drafts waiting stat card, add a Tooltip saying what counts as a draft." For
visual changes, Dan pastes a screenshot with the area circled. The page updates in a few seconds.

## Phase 1 check before handing over

1. Take screenshots with Playwright at 1440 px and 390 px wide.
2. List anything on the page that doesn't come from `COMPONENTS.md`.
3. List any number typed into a page instead of read from `src/data/`.
4. Report how long the build took from spec to finished page.

## Phase 1 done when

- The page matches the spec at both widths.
- The checks find nothing outside the component library and no typed-in numbers.
- Dan can ask for a change and see it in the browser without restarting anything.

## Phase 2: Platform swap (desktop, iOS, Android)

Start only after Dan has reviewed Phase 1. The goal: the same page built three ways from the same data
and the same page spec, by swapping the component library. This is a trial on the side. Nothing here
changes the real Tamago app.

**The three versions**

| Version | Library | Look |
| --- | --- | --- |
| Desktop | shadcn/ui (from Phase 1) | Its own look, not iOS-like. Theme tokens in one file so Dan can give it a distinct direction later |
| iOS | Konsta UI, iOS theme | Apple's patterns: large title, grouped lists, tab bar at the bottom |
| Android | Konsta UI, Material theme | Google's Material patterns: top app bar, cards, bottom navigation bar |

Konsta UI is free (MIT) and built on Tailwind. The same components switch between iOS and Material with
one theme setting. Check Konsta's current docs for setup and component names before writing anything.

**How the swap works**
1. **Write a platform-neutral page spec:** `specs/content-health.md`. It lists what the page must show
   and in what order of importance, with no layout or components. The Phase 1 page spec becomes this file.
2. **One component list per platform:** `COMPONENTS.desktop.md`, `COMPONENTS.ios.md`,
   `COMPONENTS.material.md`. Each lists only that library's components, in the same format as Phase 1.
3. **Same data for all three:** everything still comes from `src/data/`.
4. **Same agents, run once per platform.** The coordinator gives each agent the platform name and that
   platform's component list. Each version lives in its own folder: `src/platforms/desktop/`,
   `src/platforms/ios/`, `src/platforms/material/`.
5. **Platform conventions, not just colors.** The phone versions follow their platform's patterns. For
   example, the language table becomes a list of rows on phones, showing language, status and coverage,
   with the rest one tap away. The content and priorities stay the same; the layout follows each platform.

**Viewing and comparing**
- A switcher in the corner (and `?platform=desktop|ios|material` in the address) shows one version at a time.
- A **Compare** view shows all three side by side: desktop at 1440 px, and both phones in 390 px frames.

**Check before handing over**
1. Screenshots of each version: desktop at 1440 px, iOS and Android at 390 px.
2. For each version, list anything not from that platform's component list.
3. A short table of how each section changed per platform (for example: table → list rows).
4. Report how long each rebuild took from the shared spec.

**Done when**
- All three versions show the same content from the same data.
- Each uses only its own library and follows its platform's conventions.
- Switching platforms takes one click, and the Compare view shows all three at once.

## Later, if the trial is worth it

- Connect the library through an MCP server or Figma Code Connect, so agents read real design-system
  components instead of a markdown file.
- Add Fable as a judge that reviews each page against `COMPONENTS.md` and the spec.
- Replace the mock data with Tamago's real build output.
