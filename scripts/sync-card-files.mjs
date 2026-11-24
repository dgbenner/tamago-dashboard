// Copies the files the System Card opens, exactly as they are on github.com/dgbenner/tamago (main), into
// src/data/system-card-files.json, with the commit they came from. Run it when those files change:
//   node scripts/sync-card-files.mjs
// Stops, writing nothing, if a summary in system-card-docs.json points at text its file no longer has.
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'

const at = (p) => new URL(`../src/data/${p}`, import.meta.url)
const { docs } = JSON.parse(readFileSync(at('system-card-docs.json'), 'utf8'))
const gh = (...args) => execFileSync('gh', ['api', ...args], { encoding: 'utf8', maxBuffer: 1 << 26 })
const { sha, commit } = JSON.parse(gh('repos/dgbenner/tamago/commits/main'))
const files = {}
for (const { file } of Object.values(docs)) {
  if (file) files[file] ??= gh('-H', 'Accept: application/vnd.github.raw', `repos/dgbenner/tamago/contents/${file}?ref=${sha}`)
}
const lost = []
for (const [name, d] of Object.entries(docs)) {
  if (d.same) { if (!docs[d.same]) lost.push(`${name}: no such document "${d.same}"`); continue }
  const marks = [...d.sections.map((s) => s[2]), ...(d.ranges ?? []).flat().filter(Boolean)]
  for (const m of marks) if (!files[d.file].split('\n').some((l) => l.includes(m))) lost.push(`${name}: "${m}" is not in ${d.file}`)
}
if (lost.length) { console.error(lost.join('\n')); process.exit(1) }
writeFileSync(at('system-card-files.json'), JSON.stringify({ commit: sha.slice(0, 7), date: commit.committer.date.slice(0, 10), files }, null, 1) + '\n')
console.log(`${Object.keys(files).length} files at ${sha.slice(0, 7)}`)
