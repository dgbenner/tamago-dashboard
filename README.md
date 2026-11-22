# Tamago dashboard

A trial dashboard built by several specialist agents from one component library.

Live: https://dgbenner.github.io/tamago-dashboard/

- **Content Health, Content Growth, System Health and Agent Activity show real numbers**, taken as a snapshot from the public Tamago
  repository and its GitHub records. Counts only. The date and time of the snapshot is at the top of each page.
- **Cost is still a placeholder.** Every number on it is made up, and a red banner says so.
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

### Daily refresh

`.github/workflows/daily-snapshot.yml` does the same thing on GitHub once a day at 10:37 UTC (4:37 AM in Chicago in
winter, 5:37 AM in summer; GitHub can start scheduled runs late, so it is set off the hour and well before 6 AM). It takes the snapshot in Chicago time,
runs the typecheck, the component and typed-number audits, the screenshots and the local page check, commits
`snapshot.json` and `snapshot-history.json`, runs the secrets scan, pushes, deploys, and then runs the live-link check.
It uses only the built-in `GITHUB_TOKEN`. Any failed step stops it before the push, so the live site keeps the last
good snapshot.

To refresh at once, either press **Run workflow** on the Daily snapshot workflow in the repo's Actions tab, or run
the manual steps above. The workflow commits to `main` every day, so run `git pull` before a manual snapshot.

`CLAUDE.md` and `COMPONENTS.md` hold the rules and the component list the agents build from.
