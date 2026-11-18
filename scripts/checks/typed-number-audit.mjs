// Lists every line of page code that contains a digit, after removing the places where digits are
// expected (Tailwind class names, imports, comments, identifiers such as `a1Coverage`).
// It also fails on any network call. What is left needs a person to read it: a styling number
// (a margin, a stroke width) is fine; a number that describes the content must come from src/data/.
//
//   node scripts/checks/typed-number-audit.mjs
import { pageCodeFiles } from './shared.mjs'

/** Props whose numbers are styling, not content. Lines that only set these are listed separately. */
const STYLING = /\b(margin|strokeWidth|fillOpacity|radius|width|height|tickMargin|minTickGap|activeDot|barSize|maxBarSize)=/

const content = []
const styling = []
const network = []
let inBlockComment = false

for (const { file, lines } of pageCodeFiles()) {
  lines.forEach((raw, index) => {
    let line = raw
    if (inBlockComment) {
      if (!line.includes('*/')) return
      line = line.slice(line.indexOf('*/') + 2)
      inBlockComment = false
    }
    if (/\b(fetch|XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b\s*\(|['"`]https?:\/\//.test(line)) {
      network.push(`${file}:${index + 1}  ${raw.trim().slice(0, 100)}`)
    }
    line = line
      .replace(/\{\/\*.*?\*\/\}/g, '') // JSX comments
      .replace(/\/\*.*?\*\//g, '') // one-line block comments
    if (line.includes('/*')) {
      inBlockComment = true
      line = line.slice(0, line.indexOf('/*'))
    }
    line = line.replace(/\/\/.*$/, '') // line comments
    if (/^\s*import\b/.test(line) || /^\s*\*/.test(line)) return
    if (/className|^\s*['"`][^'"`]*['"`]\s*[+,]?\s*$/.test(line)) return // Tailwind class strings

    const stripped = line
      .replace(/\b[A-Za-z_$][\w$]*/g, (word) => (/\d/.test(word) ? '' : word)) // identifiers like a1Coverage, h1
      .replace(/'[^']*-\d+'|var\(--[\w-]+\)/g, '') // keys such as 'builder-1', CSS variables
    if (!/\d/.test(stripped)) return

    const entry = `${file}:${index + 1}  ${raw.trim().slice(0, 100)}`
    if (STYLING.test(line)) styling.push(entry)
    else content.push(entry)
  })
}

console.log(`Styling numbers (expected, ${styling.length}):`)
for (const entry of styling) console.log(`  ${entry}`)

console.log(`\nOther lines with a number (${content.length}). Read each one:`)
for (const entry of content) console.log(`  ${entry}`)
console.log('\nA line here is fine when the number is an index, a sign or a default (`[0]`, `? 1 : -1`).')
console.log('It is a failure when the number is something the page shows.')

if (network.length) {
  console.log(`\n${network.length} network call(s) or web address(es) in page code:`)
  for (const entry of network) console.log(`  ${entry}`)
  process.exit(1)
}
console.log('\nNo network calls in page code.')
