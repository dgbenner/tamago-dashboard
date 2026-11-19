# Tamago dashboard

A trial dashboard built by several specialist agents from one component library.

Live: https://dgbenner.github.io/tamago-dashboard/

- **Content health, Health and Agent activity show real numbers**, taken as a snapshot from the public Tamago
  repository and its GitHub records. Counts only. The date and time of the snapshot is at the top of each page.
- **Growth and Cost are still placeholders.** Every number on them is made up, and a red banner says so.
- The published pages make no network calls. Everything they show is in `src/data/`.

## Commands

- `npm install`, then `npm run dev` to run it locally.
- `npm run snapshot` collects the real numbers again (see below).
- The checks are in `scripts/checks/`, with their own README.
- Pushing to `main` builds and deploys the site to GitHub Pages.

## The snapshot

`npm run snapshot` (`scripts/snapshot.mjs`) needs `git` and the GitHub command line tool, `gh`.

- It keeps a clean copy of what is pushed to `dgbenner/tamago` in `.cache/` inside this project and reads the numbers
  from there, and from the GitHub API. It never reads or writes a local working copy of Tamago.
- It writes `src/data/snapshot.json`, stamped with the date and time, and adds one entry to
  `src/data/snapshot-history.json`. Trend lines appear on the pages once the history holds two snapshots.
- A number with no real source is written as empty and shown as "Not measured yet". Nothing is estimated.
- To publish a new snapshot: run it, run the checks, commit and push.

`CLAUDE.md` and `COMPONENTS.md` hold the rules and the component list the agents build from.
