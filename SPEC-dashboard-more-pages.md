# Spec: Four more dashboard pages (placeholders)

For Claude Code, in `~/Sites/builder-trial`. Adds four pages to the Phase 1 dashboard. Every number is
mock data. The goal is to see the pages and their layout now. Real data comes later.

## Rules

- Same rules as Phase 1 (`CLAUDE.md`): only components in `COMPONENTS.md`, each agent writes only in its
  own folder, no network calls, every number comes from `src/data/`.
- Each new page shows a "Sample data" badge next to its title.
- Don't start Phase 2. Phase 2 still covers only the Content health page.

## Sidebar

Tamago, then: Content health, Growth, Health, Agent activity, Cost. Health replaces the Deploys and
Audits items.

## Pages

### Growth

How much Tamago's content has grown.

- Stat cards: Languages, Lessons, Sentences, A1 words covered (average %).
- Line chart: lessons per language, weekly, last 12 weeks.
- Table: one row per language: lessons added this week, lessons added this month, total lessons.

### Health

Whether the site is up and the builds pass.

- Stat cards: Uptime this month (%), Average response time (ms), Checks passed in the last build
  (e.g. "203/204"), Deploys this week.
- Line chart: response time, daily, last 14 days.
- Table: audits: name, last run, result (Pass / Fail badge).
- Real uptime needs a check that visits the site every few minutes. Mock data stands in for now.

### Agent activity

What the agents did.

- Stat cards: Agent runs this week, Fable reviews, Items Fable flagged, Runs stopped by a stop rule.
- Bar chart: runs per day by agent, last 14 days.
- Table: last 20 runs: time, agent (Builder 1, Builder 2, Fable, Debugger), task, result
  (Done / Flagged / Stopped badge), duration.

### Cost

What the agent runs cost.

- Stat cards: Cost this month ($), Average cost per run, Tokens this month, Highest-cost agent.
- Bar chart: cost per day, last 30 days.
- Table: one row per agent: runs, tokens, cost, average cost per run.

## Agents

- `data` first: mock data for all four pages, as typed JSON in `src/data/`.
- Then `layout`, `tables` and `charts` at the same time: the sidebar and page shells, the tables, and the
  stat cards and charts.

## Check before handing over

1. Screenshots of each new page at 1440 px and 390 px.
2. List anything on the new pages that doesn't come from `COMPONENTS.md`.
3. List any number typed into a page instead of read from `src/data/`.

## Done when

- All five pages open from the sidebar.
- Each new page shows its "Sample data" badge.
- The checks find nothing outside the component library and no typed-in numbers.
