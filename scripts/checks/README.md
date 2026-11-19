# Checks

Four scripts that check the dashboard against the rules in `CLAUDE.md`. Run them from the project root.

Before the first run: `npm install`. The two browser checks use Playwright with the Google Chrome
already installed on this machine, so there is no browser to download.

| Check | Command | Needs |
| --- | --- | --- |
| Screenshots at two widths | `node scripts/checks/screenshots.mjs` | The dev server running (`npm run dev`) |
| Component audit | `node scripts/checks/component-audit.mjs` | Nothing |
| Typed-number audit | `node scripts/checks/typed-number-audit.mjs` | Nothing |
| Live-link check | `node scripts/checks/live-check.mjs` | The published site |

Each script exits with an error when it finds a problem, except where noted below.

## Screenshots at two widths

```
node scripts/checks/screenshots.mjs          # the local dev server
node scripts/checks/screenshots.mjs live     # the published site
```

Opens all five pages at 1440 px and 390 px wide and saves a full-height screenshot of each to
`screenshots/`, replacing the old ones. It fails if a page logs a console error, scrolls sideways, or
has no cards or table rows, or no chart on a page that should have one. It does not judge how a page looks; open the screenshots for that.

## Component audit

```
node scripts/checks/component-audit.mjs
```

Lists anything in the page code (`src/layout`, `src/pages`, `src/tables`, `src/charts`, `src/App.tsx`)
that does not come from `COMPONENTS.md`:

- an import from a package or a component file that is not on the list
- a Recharts part that is not named in the Chart entry, or Recharts used outside `src/charts/`
- a plain control such as `<button>`, `<input>` or `<table>` where a library component exists
- a color typed in as hex, `rgb()` or `oklch()` instead of a theme token

It reads the allowed files and Recharts parts from `COMPONENTS.md` itself, so adding a component to
that file is all it takes to allow it.

**What it cannot see:** plain elements styled into a widget. The warning banner in
`src/layout/AppShell.tsx` is one, and this check passes it. The script prints the plain elements it
found so a person can look.

## Typed-number audit

```
node scripts/checks/typed-number-audit.mjs
```

Lists every line of page code that contains a number, after removing Tailwind class names, imports,
comments and names such as `a1Coverage`. It prints two lists:

- **Styling numbers:** margins, stroke widths and similar chart props. These are expected.
- **Other lines:** read each one. An index, a sign or a default (`[0]`, `? 1 : -1`) is fine. A number
  that the page shows is a failure: it belongs in `src/data/`.

This list needs a person to read it, so the script does not fail on it. It does fail if the page code
contains a network call or a web address.

**What it cannot see:** numbers written inside the text in `src/data/` (for example "Last 7 days" in
`labels.json`). Those are in the data folder, but they are typed, not computed.

## Live-link check

```
node scripts/checks/live-check.mjs           # the published site
node scripts/checks/live-check.mjs local     # the local dev server
```

Opens each page from its own address, the way a bookmark would, scrolls to the bottom, then refreshes.
For each page it prints `DONE` or `NOT DONE` with the reasons. A page is done when:

- the right page opens, and is the same after a refresh
- a real page (Content Health, Content Growth, Health, Agent Activity) has the line "Real data, snapshot from …" with a date and
  time, and no "Sample Data" badge
- a placeholder page (Cost) has the red warning banner with its exact text, and the "Sample Data" badge
- the banner is still at the top after scrolling
- it has cards and table rows, and a chart where the page has one
- it asks the network for nothing beyond the site's own files
- the `noindex` tag is present

Run it a minute or two after a push, once the deploy in the repo's Actions tab has finished.

## Before a push

Run the secrets scan as well. It is not one of these scripts:

```
gitleaks git --redact .
```

## If the pages change

- The page list, which pages are real, and the two addresses are in `shared.mjs`.
- The banner texts are in `live-check.mjs`.

## A new snapshot

`npm run snapshot` collects the real numbers again (see the main README). Run these checks after it, before pushing.
