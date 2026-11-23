// npm run snapshot
//
// Collects real numbers about Tamago into src/data/snapshot.json, stamps the date and time, and adds a line to
// src/data/snapshot-history.json so trends build up from the first run.
//
// Where the numbers come from:
//   - A clean copy of what is pushed to github.com/dgbenner/tamago (main), kept in .cache/tamago inside THIS project.
//     Nothing is read from or written to ~/Sites/tamago, so unpushed work there never shows up here.
//   - The GitHub API, through the `gh` command: push events and the "Full suite" workflow runs.
//
// Rules it keeps: counts only. No sentence text, nothing from _review/, no names or emails. A number with no real
// source is written as null and the pages show it as "Not measured yet"; nothing is estimated.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'

const ROOT = path.resolve(import.meta.dirname, '..')
const CACHE = path.join(ROOT, '.cache')
const CLONE = path.join(CACHE, 'tamago')
const DATA = path.join(ROOT, 'src/data')
const REPO = 'dgbenner/tamago'
const WORKFLOW = 'full-suite.yml'
const RECENT_DEPLOYS = 10
const ACTIVITY_DAYS = 14

const run = (cmd, args, options = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 256 * 1024 * 1024, ...options })
const git = (...args) => run('git', ['-C', CLONE, ...args]).trimEnd()
const gh = (...args) => run('gh', args)
const readJson = (file) => JSON.parse(readFileSync(path.join(CLONE, file), 'utf8'))

// ---- 1. The clean copy -------------------------------------------------------------------------------------------
// A partial, sparse clone: the history, plus only the files the numbers come from (no audio, pictures or workbooks).
const SPARSE = ['/package.json', '/scripts/', '/src/lib/', '/src/version.json', '/src/content*/', '/content*/a1-*.json', '/_source/*.md']
mkdirSync(CACHE, { recursive: true })
if (!existsSync(path.join(CLONE, '.git'))) {
  run('git', ['clone', '-q', '--filter=blob:none', '--sparse', '--no-checkout', `https://github.com/${REPO}.git`, CLONE])
  git('sparse-checkout', 'set', '--no-cone', ...SPARSE)
}
git('fetch', '-q', 'origin', 'main')
git('checkout', '-q', '--detach', 'origin/main')
const head = { commit: git('rev-parse', '--short', 'HEAD'), date: git('log', '-1', '--format=%cI') }

// ---- 2. Text that may be shown ----------------------------------------------------------------------------------
// Commit subjects say what changed. Before one is kept it must hold no email, and no course sentence.
const dirOf = (id) => (id === 'fr' ? 'content' : `content-${id}`)
const courseSentences = new Set()
const noteSentences = (rows) => {
  for (const row of rows) for (const [key, value] of Object.entries(row)) {
    if (typeof value !== 'string' || key.endsWith('_id') || value.trim().split(/\s+/).length < 3) continue
    if (['sentence_id', 'unit_id', 'source', 'status', 'notes', 'origin', 'native_check', 'audio_source', 'source_owner', 'english_source'].includes(key)) continue
    courseSentences.add(value.trim().toLowerCase())
  }
}
const safeSubject = (subject) => {
  const lower = subject.toLowerCase()
  if (/@|https?:\/\//.test(subject)) return null
  for (const sentence of courseSentences) if (sentence.length >= 12 && lower.includes(sentence)) return null
  return subject.length > 140 ? `${subject.slice(0, 137).trimEnd()}…` : subject
}

// ---- 3. Languages -----------------------------------------------------------------------------------------------
// The course list is read as text (src/lib/course.js): id, name and whether it is ready.
const courseSource = readFileSync(path.join(CLONE, 'src/lib/course.js'), 'utf8')
const courses = [...courseSource.matchAll(/\{\s*id:\s*'(\w+)',\s*name:\s*'([^']+)'[^\n]*?ready:\s*(true|false)/g)]
  .map(([, id, name, ready]) => ({ id, name, ready: ready === 'true' }))
if (!courses.length) throw new Error('No courses found in src/lib/course.js. Has its format changed?')

// A1 coverage comes from the repo's own report (scripts/a1-coverage.mjs, which writes nothing). A course with a
// "core" target (its list's 600 most frequent words) is measured against that, as the repo's check-in does;
// the others against their whole list.
function coverageOf(id) {
  let report
  try {
    report = run('node', ['scripts/a1-coverage.mjs'], { cwd: CLONE, env: { ...process.env, COURSE: id } })
  } catch {
    return null
  }
  const list = report.match(/^A1 list: (\d+) words \((.+)\)$/m)
  const full = report.match(/^\s*taught anywhere: (\d+) \((\d+)%\)/m)
  const core = report.match(/^Core: the (\d+) most frequent: taught (\d+) \((\d+)%\)/m)
  if (!list || !full) return null
  // The short name: "FLELex (CEFRLex project)" → "FLELex".
  const listName = list[2].replace(/\s*\(.*$/, '')
  return core
    ? { list: listName, scope: `core ${core[1]}`, taught: Number(core[2]), total: Number(core[1]), percent: Number(core[3]) }
    : { list: listName, scope: 'full list', taught: Number(full[1]), total: Number(list[1]), percent: Number(full[2]) }
}

const languages = courses.map(({ id, name, ready }) => {
  const dir = `src/${dirOf(id)}`
  // Planned: listed in the app, no content pushed. Started: content pushed, not open in the app yet.
  if (!existsSync(path.join(CLONE, dir, 'sentences.json'))) {
    return { id, name, state: 'coming-soon', status: null, partsLive: null, partsTotal: null, level: null, circles: null, words: null, wordsWiktionary: null, recordingsLinguaLibre: null, sentences: null, sentencesTatoeba: null, sentencesDrafted: null, coverage: null, draftsWaiting: null, lastDeploy: null }
  }
  const sentences = readJson(`${dir}/sentences.json`).filter((s) => s.status === 'live')
  noteSentences(sentences)
  const parts = readJson(`${dir}/parts.json`)
  const partsLive = parts.filter((p) => p.status === 'live').length
  const drafted = sentences.filter((s) => s.source === 'tamago_original')
  return {
    id, name, state: ready ? 'live' : 'started',
    // Complete when every part the course lists is live.
    // Live: every part live. Live, incomplete: open in the app with parts still to come. Started: not open yet.
    status: !ready ? 'started' : partsLive === parts.length ? 'complete' : 'incomplete',
    partsLive, partsTotal: parts.length,
    // The CEFR level the course teaches: its units' cefr column ("A1"; "A1–A2" if it ever spans two).
    level: [...new Set(readJson(`${dir}/units.json`).map((u) => u.cefr).filter(Boolean))].sort().join('–') || null,
    // Circles: the places on the tree (tree_layout). Topic packs chosen inside a "Pick Your Own" circle are not counted.
    circles: readJson(`${dir}/tree_layout.json`).length,
    // Words: the course's shipped word list (src/content*/words.json), the same count a1-coverage reports.
    words: readJson(`${dir}/words.json`).length,
    // The three outside language sources: Tatoeba (sentences, below), Wiktionary (a word's meaning and hint, when
    // the word's hint_source names it) and Lingua Libre (a real person's recording, for a word or a sentence).
    // Counts only: never the recorders' names.
    wordsWiktionary: readJson(`${dir}/words.json`).filter((w) => /wiktionary/i.test(String(w.hint_source ?? ''))).length,
    recordingsLinguaLibre: readJson(`${dir}/words.json`).filter((w) => w.lingua_libre?.audio_file).length
      + sentences.filter((s) => s.audio_source === 'lingua_libre').length,
    sentences: sentences.length,
    sentencesTatoeba: sentences.filter((s) => s.source === 'tatoeba').length,
    sentencesDrafted: drafted.length,
    coverage: coverageOf(id),
    // Drafted sentences whose native-speaker check is still marked as needed.
    draftsWaiting: drafted.filter((s) => /needed/i.test(String(s.native_check ?? ''))).length,
    lastDeploy: null, // filled in below
  }
})

// ---- 4. Deploys -------------------------------------------------------------------------------------------------
// Every change to src/version.json is one deploy: its number, and the animal name its place in the run gives it.
const animals = [...readFileSync(path.join(CLONE, 'src/lib/version.js'), 'utf8').match(/ANIMALS = \[([\s\S]*?)\]/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1])
const nameOf = (seq) => animals[(((seq - 1) % animals.length) + animals.length) % animals.length]
const bumps = git('log', '--format=%H\t%cI', '--', 'src/version.json').split('\n').filter(Boolean).map((line) => {
  const [sha, date] = line.split('\t')
  let version = null
  try { version = JSON.parse(git('show', `${sha}:src/version.json`)) } catch { /* an unreadable version file is skipped */ }
  return { sha, date, version }
}).filter((b) => b.version?.number != null)
// Newest first; a number seen twice (a merge) keeps its newest commit.
const seen = new Set()
const allDeploys = bumps.filter((b) => !seen.has(b.version.number) && seen.add(b.version.number))

// The "Full suite" runs on GitHub Actions, newest first. Counts are read from the run's log, kept in .cache.
let runs = []
try {
  runs = JSON.parse(gh('api', `repos/${REPO}/actions/workflows/${WORKFLOW}/runs?branch=main&per_page=100`)).workflow_runs
    .map((r) => ({ id: r.id, sha: r.head_sha, status: r.status, conclusion: r.conclusion, startedAt: r.run_started_at ?? r.created_at, finishedAt: r.updated_at }))
} catch { /* no runs to read: every test result stays "not recorded" */ }
const countsFile = path.join(CACHE, 'run-counts.json')
const countsCache = existsSync(countsFile) ? JSON.parse(readFileSync(countsFile, 'utf8')) : {}
function countsOf(run) {
  if (run.status !== 'completed') return null
  if (countsCache[run.id]) return countsCache[run.id]
  try {
    const log = gh('run', 'view', String(run.id), '--repo', REPO, '--log')
    const sum = (label) => [...log.matchAll(new RegExp(`ℹ ${label} (\\d+)`, 'g'))].reduce((n, m) => n + Number(m[1]), 0)
    const counts = { tests: sum('tests'), passed: sum('pass'), failed: sum('fail'), skipped: sum('skipped') }
    if (!counts.tests) return null
    countsCache[run.id] = counts
    writeFileSync(countsFile, JSON.stringify(countsCache, null, 2))
    return counts
  } catch {
    return null
  }
}
const testOf = (run) => {
  if (!run) return { result: 'not-recorded', tests: null, passed: null, failed: null }
  if (run.status !== 'completed') return { result: 'running', tests: null, passed: null, failed: null }
  const counts = countsOf(run)
  const result = run.conclusion === 'success' ? 'passed' : run.conclusion === 'cancelled' ? 'cancelled' : 'failed'
  return { result, tests: counts?.tests ?? null, passed: counts?.passed ?? null, failed: counts?.failed ?? null }
}

const deploys = allDeploys.map((bump, index) => {
  const previous = allDeploys[index + 1]
  const range = previous ? `${previous.sha}..${bump.sha}` : bump.sha
  const next = allDeploys[index - 1]
  const commits = git('log', '--format=%H\t%s', range).split('\n').filter(Boolean).map((line) => line.split('\t'))
  // A run belongs to this deploy when it tested a commit from this deploy up to (not including) the next one.
  const until = next ? git('log', '--format=%H', `${bump.sha}..${next.sha}`).split('\n').filter(Boolean).filter((sha) => sha !== next.sha) : git('log', '--format=%H', `${bump.sha}..HEAD`).split('\n').filter(Boolean)
  const tested = new Set([bump.sha, ...until])
  const run = runs.find((r) => tested.has(r.sha))
  const subjects = commits.map(([, subject]) => subject).filter((subject) => !/^version bump$/i.test(subject.trim()) && !/^merge /i.test(subject))
  const shown = subjects.map(safeSubject)
  return {
    number: bump.version.number,
    name: nameOf(bump.version.seq ?? bump.version.number),
    date: bump.date,
    commit: bump.sha.slice(0, 7),
    changes: shown.filter(Boolean),
    changesHidden: shown.filter((s) => s === null).length,
    test: testOf(run),
    range,
  }
})

// Each language's last deploy: the newest deploy that changed its content folder.
for (const language of languages.filter((l) => l.state === 'live')) {
  const deploy = deploys.find((d) => git('log', '--format=%H', d.range, '--', `src/${dirOf(language.id)}`) !== '')
  language.lastDeploy = deploy ? { number: deploy.number, name: deploy.name, date: deploy.date } : null
}

// ---- 5. Health --------------------------------------------------------------------------------------------------
// The newest run that finished. A cancelled run (a newer push replaced it) has no result, so it is passed over.
const latestRun = runs.find((r) => r.status === 'completed' && r.conclusion !== 'cancelled') ?? null
const latestCounts = latestRun ? countsOf(latestRun) : null
function isAncestor(a, b) { try { run('git', ['-C', CLONE, 'merge-base', '--is-ancestor', a, b]); return true } catch { return false } }
const deployOfRun = latestRun ? deploys.find((d) => isAncestor(d.commit, latestRun.sha)) : null

// Audits leave no result file. The build log sometimes says in words that they were clean; the newest such line is
// kept as a dated note, never as a measurement.
const buildLog = readFileSync(path.join(CLONE, '_source/build-log.md'), 'utf8')
let auditNote = null
{
  let heading = null
  for (const line of buildLog.split('\n')) {
    const h = line.match(/^## (\d{4}-\d{2}-\d{2}): (.+)$/)
    if (h) heading = { date: h[1], title: h[2] }
    else if (heading && /both audits clean/i.test(line)) auditNote = { date: heading.date, entry: safeSubject(heading.title) }
  }
}

// The step a failed run stopped at, from the run's jobs, so a run that never reached its tests says so.
let stoppedAt = null
if (latestRun && latestRun.conclusion !== 'success') {
  try {
    const jobs = JSON.parse(gh('api', `repos/${REPO}/actions/runs/${latestRun.id}/jobs`)).jobs
    stoppedAt = jobs.flatMap((job) => job.steps ?? []).find((step) => step.conclusion === 'failure')?.name ?? null
  } catch { /* the step stays unknown */ }
}
const health = {
  fullSuite: latestRun ? {
    result: latestRun.conclusion === 'success' ? 'passed' : 'failed',
    startedAt: latestRun.startedAt, finishedAt: latestRun.finishedAt,
    durationSeconds: Math.round((new Date(latestRun.finishedAt) - new Date(latestRun.startedAt)) / 1000),
    tests: latestCounts?.tests ?? null, passed: latestCounts?.passed ?? null, failed: latestCounts?.failed ?? null, skipped: latestCounts?.skipped ?? null,
    commit: latestRun.sha.slice(0, 7), deploy: deployOfRun ? { number: deployOfRun.number, name: deployOfRun.name } : null,
    runsRecorded: runs.length,
    stoppedAt,
  } : null,
  // Written in the build log, not measured by this snapshot.
  auditNote,
  // No record exists for these, so they are null: "Not measured yet".
  audits: null, smokeTest: null, fastTier: null, uptimePercent: null, responseTimeMs: null,
}

// ---- 6. Activity ------------------------------------------------------------------------------------------------
const takenAt = new Date()
const localDay = (date) => { const d = new Date(date); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const tally = (dates) => dates.reduce((map, date) => map.set(localDay(date), (map.get(localDay(date)) ?? 0) + 1), new Map())
const commitsByDay = tally(git('log', '--format=%cI').split('\n').filter(Boolean))
let pushesByDay = null
try {
  const events = gh('api', `repos/${REPO}/events?per_page=100`, '--paginate', '--jq', '.[] | select(.type=="PushEvent") | .created_at').split('\n').filter(Boolean)
  pushesByDay = tally(events)
} catch { /* pushes stay null: not recorded */ }
const deploysByDay = tally(allDeploys.map((d) => d.date))
const days = Array.from({ length: ACTIVITY_DAYS }, (_, i) => {
  const d = new Date(takenAt); d.setDate(d.getDate() - (ACTIVITY_DAYS - 1 - i))
  const date = localDay(d)
  return { date, commits: commitsByDay.get(date) ?? 0, pushes: pushesByDay ? pushesByDay.get(date) ?? 0 : null, deploys: deploysByDay.get(date) ?? 0 }
})
const reviewsApplied = git('log', '--format=%cI\t%s').split('\n').filter(Boolean).map((line) => line.split('\t'))
  .filter(([, subject]) => /reviews? applied|fable-reviewed|fable's candidates applied|fable's vocabulary review/i.test(subject))
  .map(([date, subject]) => ({ date, subject: safeSubject(subject) }))
  .filter((r) => r.subject)

const activity = {
  days,
  firstCommit: git('log', '--reverse', '--format=%cI').split('\n')[0],
  commitsTotal: Number(git('rev-list', '--count', 'HEAD')),
  deploysTotal: allDeploys.length,
  reviewsApplied,
  // Not recorded anywhere in the repo or on GitHub: which agent did a piece of work, how long a run took, what an
  // agent flagged, and runs stopped by a stop rule.
  runsByAgent: null, runDurations: null, itemsFlagged: null, runsStopped: null,
}

// ---- 6b. Content growth ------------------------------------------------------------------------------------------
// Lessons per course, read from each course's units.json at past versions of main. A course's lessons are the sum of
// every unit's lesson_counts (five rounds each; topic packs included, since they are lessons a learner can take).
// lesson_counts first appears in the repo on 2026-11-10; before a course records them for every unit, its total is
// null (not measured), never estimated. A course whose content folder doesn't exist yet at that version has none.
const lessonsAt = (() => {
  const cache = new Map()
  return (sha, id) => {
    const key = `${sha}:${id}`
    if (cache.has(key)) return cache.get(key)
    let total = 0
    try {
      const units = JSON.parse(run('git', ['-C', CLONE, 'show', `${sha}:src/${dirOf(id)}/units.json`], { stdio: ['ignore', 'pipe', 'ignore'] }))
      const withLessons = units.filter((u) => u.is_topic_pick !== 'node') // a topic node holds no lessons of its own
      total = withLessons.every((u) => Array.isArray(u.lesson_counts))
        ? withLessons.reduce((n, u) => n + u.lesson_counts.reduce((a, b) => a + b, 0), 0)
        : null
    } catch {
      total = 0 // the course's content folder isn't there yet at this version
    }
    cache.set(key, total)
    return total
  }
})()
// main as it stood at the end of each local day: the last commit on its first-parent line by then.
const mainLine = git('log', '--first-parent', '--format=%H\t%cI', 'HEAD').split('\n').filter(Boolean).map((line) => line.split('\t'))
const shaAt = (moment) => mainLine.find(([, date]) => new Date(date) <= moment)?.[0] ?? null
const endOfDay = (date) => new Date(`${date}T23:59:59`)
const liveIds = languages.filter((l) => l.state === 'live').map((l) => l.id)
const firstDay = localDay(mainLine.at(-1)[1])
const growthDays = []
for (let d = new Date(`${firstDay}T12:00:00`); localDay(d) <= localDay(new Date()); d.setDate(d.getDate() + 1)) {
  const sha = shaAt(endOfDay(localDay(d)))
  growthDays.push({ date: localDay(d), lessons: Object.fromEntries(liveIds.map((id) => [id, sha ? lessonsAt(sha, id) : 0])) })
}
// Totals now, and how many were added since the start of the snapshot's week (last 7 days) and month. A period that
// starts before the repo's first commit starts from zero, since there was no course then.
const totalAt = (moment, id) => { const sha = shaAt(moment); return sha ? lessonsAt(sha, id) : 0 }
const now = new Date()
const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 7)
const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
const growthLanguages = liveIds.map((id) => {
  const total = lessonsAt(git('rev-parse', 'HEAD'), id)
  const week = totalAt(weekStart, id)
  const month = totalAt(monthStart, id)
  return {
    id,
    name: languages.find((l) => l.id === id).name,
    totalLessons: total,
    newThisWeek: total === null || week === null ? null : total - week,
    newThisMonth: total === null || month === null ? null : total - month,
  }
})
const growth = {
  days: growthDays,
  firstMeasured: growthDays.find((day) => Object.values(day.lessons).some((n) => n !== null && n > 0))?.date ?? null,
  languages: growthLanguages,
}

// ---- 6b. Claude Code tokens (local only) ------------------------------------------------------------------------
// Claude Code saves every session on this Mac in ~/.claude/projects, one JSON line per message. Each reply records
// its model and the tokens it used. Only replies from sessions working in ~/Sites/tamago or one of its worktrees
// (~/Sites/tamago-*) count. Counts only: no message text is read into the snapshot. The GitHub run has no such
// folder, so it keeps the last count, which carries its own measuredAt date.
const USAGE_DAYS = 14
const SESSIONS = path.join(os.homedir(), '.claude', 'projects')
const TAMAGO_DIR = path.join(os.homedir(), 'Sites', 'tamago')
/** ~/Sites/tamago itself, or a worktree beside it named tamago-<something>, or any folder inside either. */
const isTamagoCwd = (cwd) => {
  if (cwd === TAMAGO_DIR || cwd.startsWith(`${TAMAGO_DIR}/`)) return true
  if (!cwd.startsWith(`${TAMAGO_DIR}-`)) return false
  return !cwd.slice(TAMAGO_DIR.length + 1).startsWith('/')
}
function readUsage() {
  if (!existsSync(SESSIONS)) return null
  const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.jsonl') ? [path.join(dir, e.name)] : []))
  const since = new Date(takenAt); since.setDate(since.getDate() - (USAGE_DAYS - 1)); since.setHours(0, 0, 0, 0)
  const weekStart = new Date(takenAt); weekStart.setDate(weekStart.getDate() - 7)
  const seen = new Set()
  const days = new Map()
  const week = new Map()
  const sessions = new Set()
  for (const file of walk(SESSIONS)) {
    for (const line of readFileSync(file, 'utf8').split('\n')) {
      if (!line.includes('"usage"')) continue
      let row
      try { row = JSON.parse(line) } catch { continue }
      const message = row.message
      if (row.type !== 'assistant' || !message?.usage || !row.cwd || !isTamagoCwd(row.cwd) || !row.timestamp) continue
      // A reply can be written more than once while it streams; count each message once.
      const key = message.id ?? `${file}:${row.uuid}`
      if (seen.has(key)) continue
      seen.add(key)
      const at = new Date(row.timestamp)
      if (at < since || at > takenAt) continue
      const model = message.model ?? 'unknown'
      if (model === '<synthetic>') continue
      const u = message.usage
      const counts = { input: u.input_tokens ?? 0, output: u.output_tokens ?? 0, cacheRead: u.cache_read_input_tokens ?? 0, cacheWrite: u.cache_creation_input_tokens ?? 0 }
      const total = counts.input + counts.output + counts.cacheRead + counts.cacheWrite
      const day = localDay(at)
      const dayModels = days.get(day) ?? {}
      dayModels[model] = (dayModels[model] ?? 0) + total
      days.set(day, dayModels)
      if (at >= weekStart) {
        const m = week.get(model) ?? { model, input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 }
        for (const k of ['input', 'output', 'cacheRead', 'cacheWrite']) m[k] += counts[k]
        m.total += total
        week.set(model, m)
        sessions.add(row.sessionId ?? file)
      }
    }
  }
  const dayList = Array.from({ length: USAGE_DAYS }, (_, i) => { const d = new Date(since); d.setDate(d.getDate() + i); return localDay(d) })
    .map((date) => ({ date, models: days.get(date) ?? {} }))
  return {
    scope: 'Claude Code sessions in ~/Sites/tamago and its worktrees',
    days: dayList,
    week: { sessions: sessions.size, models: [...week.values()].sort((a, b) => b.total - a.total) },
  }
}
const previousSnapshot = existsSync(path.join(DATA, 'snapshot.json')) ? JSON.parse(readFileSync(path.join(DATA, 'snapshot.json'), 'utf8')) : null
const freshUsage = readUsage()

// ---- 7. Write ---------------------------------------------------------------------------------------------------
const offset = -takenAt.getTimezoneOffset()
const stamp = `${localDay(takenAt)}T${String(takenAt.getHours()).padStart(2, '0')}:${String(takenAt.getMinutes()).padStart(2, '0')}:00${offset >= 0 ? '+' : '-'}${String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0')}:${String(Math.abs(offset) % 60).padStart(2, '0')}`
// A fresh count is stamped with this run's time; otherwise the last one is kept as it was.
const usage = freshUsage ? { measuredAt: stamp, ...freshUsage } : previousSnapshot?.usage ?? null
const snapshot = {
  takenAt: stamp,
  source: { repo: REPO, branch: 'main', commit: head.commit, commitDate: head.date },
  languages,
  deploys: deploys.slice(0, RECENT_DEPLOYS).map(({ range, ...deploy }) => deploy),
  health,
  activity,
  growth,
  usage,
}
writeFileSync(path.join(DATA, 'snapshot.json'), `${JSON.stringify(snapshot, null, 2)}\n`)

// One line per snapshot, so trends build up from the first run. Only numbers that can move.
const live = languages.filter((l) => l.state === 'live')
const historyFile = path.join(DATA, 'snapshot-history.json')
const history = existsSync(historyFile) ? JSON.parse(readFileSync(historyFile, 'utf8')) : []
const entry = {
  takenAt: stamp,
  commit: head.commit,
  languagesLive: live.length,
  coursesComplete: live.filter((l) => l.status === 'complete').length,
  sentences: live.reduce((n, l) => n + l.sentences, 0),
  circles: live.reduce((n, l) => n + l.circles, 0),
  draftsWaiting: live.reduce((n, l) => n + l.draftsWaiting, 0),
  coveragePercentAverage: live.every((l) => l.coverage) ? Math.round((live.reduce((n, l) => n + l.coverage.percent, 0) / live.length) * 10) / 10 : null,
  deployNumber: deploys[0]?.number ?? null,
  testsPassed: health.fullSuite?.passed ?? null,
  testsFailed: health.fullSuite?.failed ?? null,
  commitsTotal: activity.commitsTotal,
  // Only a count measured in this run goes in the history; a carried-forward one would repeat itself.
  tokensThisWeek: freshUsage ? usage.week.models.reduce((n, m) => n + m.total, 0) : null,
  lessons: growthLanguages.every((l) => l.totalLessons !== null) ? growthLanguages.reduce((n, l) => n + l.totalLessons, 0) : null,
  languages: Object.fromEntries(live.map((l) => [l.id, { words: l.words, sentences: l.sentences, circles: l.circles, draftsWaiting: l.draftsWaiting, coveragePercent: l.coverage?.percent ?? null }])),
}
// A second run in the same minute replaces the first.
const kept = history.filter((h) => h.takenAt !== stamp)
kept.push(entry)
writeFileSync(historyFile, `${JSON.stringify(kept, null, 2)}\n`)

console.log(`Snapshot ${stamp} of ${REPO}@${head.commit}`)
console.log(`  ${live.length} live languages, ${languages.length - live.length} coming soon, ${entry.sentences} sentences, ${entry.draftsWaiting} drafts waiting`)
console.log(`  ${snapshot.deploys.length} recent deploys (newest ${deploys[0]?.name} ${deploys[0]?.number}); full suite: ${health.fullSuite ? `${health.fullSuite.result}, ${health.fullSuite.passed}/${health.fullSuite.tests}` : 'no run recorded'}`)
console.log(`  tokens (Tamago sessions, last 7 days): ${usage ? `${usage.week.models.reduce((n, m) => n + m.total, 0)} across ${usage.week.sessions} sessions, measured ${usage.measuredAt}` : 'none recorded'}`)
console.log(`  history: ${kept.length} snapshot(s) in src/data/snapshot-history.json`)
