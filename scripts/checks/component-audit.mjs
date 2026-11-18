// Lists anything in the page code that does not come from COMPONENTS.md.
// Reads the allowed component files and Recharts parts from COMPONENTS.md itself, so the list
// and the check cannot drift apart. Exits with an error if it finds anything.
//
//   node scripts/checks/component-audit.mjs
import { readFileSync } from 'node:fs'
import path from 'node:path'

import { pageCodeFiles, ROOT } from './shared.mjs'

const doc = readFileSync(path.join(ROOT, 'COMPONENTS.md'), 'utf8')

// Library files: the `card.tsx` style names in the table at the top of COMPONENTS.md.
const libraryFiles = new Set([...doc.matchAll(/\| `([a-z-]+)\.tsx` \|/g)].map((match) => match[1]))

// Recharts parts: the names in brackets after "imported from `recharts`" in the Chart entry.
const partsList = doc.match(/imported from `recharts` \(([^)]*)\)/s)?.[1] ?? ''
const rechartsParts = new Set([...partsList.matchAll(/`(\w+)`/g)].map((match) => match[1]))

if (!libraryFiles.size || !rechartsParts.size) {
  console.error('Could not read the component list from COMPONENTS.md. Has its format changed?')
  process.exit(2)
}

// Where page code may import from, besides the library files checked below.
const ALLOWED_SOURCES = ['react', 'recharts', 'lucide-react', '@/data', '@/lib/utils']
const ALLOWED_PREFIXES = ['./', '../', '@/layout/', '@/pages/', '@/tables/', '@/charts/']

const HTML_TAGS = new Set(
  'a aside button canvas details dialog div footer form h1 h2 h3 h4 h5 h6 header iframe img input label li main nav ol p section select span summary svg table tbody td textarea tfoot th thead time tr ul video'.split(' '),
)
// Plain elements that act as controls. These must be library components instead.
const CONTROL_TAGS = new Set('button canvas details dialog form iframe input select summary svg table tbody td textarea tfoot th thead tr'.split(' '))

const findings = []
const plainElements = new Map()
const usedLibrary = new Set()
const usedParts = new Set()

for (const { file, text, lines } of pageCodeFiles()) {
  for (const match of text.matchAll(/import\s+(?:type\s+)?([\s\S]*?)\s+from\s+'([^']+)'/g)) {
    const [, names, source] = match
    const line = text.slice(0, match.index).split('\n').length

    if (source.startsWith('@/components/ui/')) {
      const name = source.slice('@/components/ui/'.length)
      usedLibrary.add(name)
      if (!libraryFiles.has(name)) findings.push(`${file}:${line} imports ${source}, which is not in COMPONENTS.md`)
    } else if (source === 'recharts') {
      if (!file.startsWith('src/charts/')) findings.push(`${file}:${line} imports recharts outside src/charts/`)
      for (const part of names.replace(/[{}]/g, '').split(',')) {
        const name = part.trim().replace(/^type\s+/, '').split(/\s+as\s+/)[0]
        if (!name) continue
        usedParts.add(name)
        if (!rechartsParts.has(name)) findings.push(`${file}:${line} uses the Recharts part ${name}, which is not in COMPONENTS.md`)
      }
    } else if (!ALLOWED_SOURCES.includes(source) && !ALLOWED_PREFIXES.some((prefix) => source.startsWith(prefix))) {
      findings.push(`${file}:${line} imports from ${source}, which is not part of the library`)
    }
  }

  lines.forEach((content, index) => {
    for (const match of content.matchAll(/(?:^|[^\w])<([a-z][a-z0-9]*)(?=[\s>/])/g)) {
      const tag = match[1]
      if (!HTML_TAGS.has(tag)) continue
      plainElements.set(tag, (plainElements.get(tag) ?? 0) + 1)
      if (CONTROL_TAGS.has(tag)) findings.push(`${file}:${index + 1} uses a plain <${tag}>; use the library component`)
    }
    // Colors must come from theme tokens. `#/growth` style links are not colors.
    if (/#[0-9a-fA-F]{3,8}\b(?!\/)|\b(?:oklch|oklab|rgba?|hsla?)\(/.test(content.replace(/#\//g, ''))) {
      findings.push(`${file}:${index + 1} has a typed-in color: ${content.trim().slice(0, 80)}`)
    }
  })
}

const list = (set) => [...set].sort().join(', ')
console.log(`Library components in COMPONENTS.md: ${list(libraryFiles)}`)
console.log(`Used by the pages:                   ${list(usedLibrary)}`)
console.log(`Recharts parts used:                 ${list(usedParts)}`)
console.log(
  `Plain layout elements (allowed):     ${[...plainElements].sort().map(([tag, count]) => `${tag} ×${count}`).join(', ')}`,
)
console.log('\nThis check cannot tell when plain elements have been styled into a widget (the warning banner in')
console.log('src/layout/AppShell.tsx is one). Read the plain elements above with that in mind.\n')

if (findings.length) {
  console.log(`${findings.length} thing(s) outside COMPONENTS.md:`)
  for (const finding of findings) console.log(`  - ${finding}`)
  process.exit(1)
}
console.log('Nothing outside COMPONENTS.md.')
