import fs from 'node:fs'
import path from 'node:path'

const [beforePath, afterPath, activePath, outputDirectory] = process.argv.slice(2)
if (!beforePath || !afterPath || !activePath || !outputDirectory) {
  throw new Error('Usage: node build-lint-semantic-inventory.mjs <before.json> <after.json> <active-files.txt> <output-dir>')
}

const root = process.cwd()
const activeFiles = new Set(fs.readFileSync(activePath, 'utf8').trim().split('\n'))
const candidateRules = new Set([
  'react-hooks/rules-of-hooks',
  'react-hooks/exhaustive-deps',
  'no-await-in-loop',
  'no-void',
  'import/export',
  'import/no-duplicates',
  'import/no-named-as-default',
  'import/no-cycle',
  'consistent-return',
  'no-loop-func',
  'no-constant-condition',
  'react/no-unused-state',
])

function flatten(report) {
  return JSON.parse(fs.readFileSync(report, 'utf8')).flatMap((file) => {
    const relativeFile = path.relative(root, file.filePath)
    return file.messages
      .filter((message) => candidateRules.has(message.ruleId))
      .map((message) => ({
        rule: message.ruleId,
        file: relativeFile,
        line: message.line,
        message: message.message,
        active: activeFiles.has(relativeFile),
      }))
  })
}

const before = flatten(beforePath)
const after = flatten(afterPath)
const afterKeys = new Set(after.map((item) => `${item.rule}\0${item.file}\0${item.message}`))

function classify(item, fixed) {
  if (!item.active) return 'N3'
  if (fixed && item.rule === 'react-hooks/rules-of-hooks') return 'S1'
  if (fixed) return 'S2'
  if (
    item.rule === 'import/no-duplicates' ||
    item.rule === 'import/no-named-as-default' ||
    (item.rule === 'react-hooks/exhaustive-deps' && item.message.includes('unnecessary'))
  ) return 'N1'
  if (item.rule === 'no-await-in-loop' || item.rule === 'no-void' || item.rule === 'no-loop-func') return 'N2'
  return 'N4'
}

function risk(item, classification) {
  if (classification === 'S1') return 'Conditional hook order could change between renders.'
  if (classification === 'S2') return 'Stale closure, stale chain/account/target, lost rejection, or ambiguous barrel export.'
  if (classification === 'N1') return 'Style or redundant dependency/import identity; no demonstrated runtime defect.'
  if (classification === 'N2') return 'Intentional sequencing or explicitly detached promise with bounded handling.'
  if (classification === 'N3') return 'Outside the active production closure (test/tooling/historical).'
  return 'Contextual false positive or guarded/stable identity; no demonstrated product risk.'
}

const classifiedBefore = before.map((item) => {
  const fixed = !afterKeys.has(`${item.rule}\0${item.file}\0${item.message}`)
  const classification = classify(item, fixed)
  return { ...item, fixed, classification, risk: risk(item, classification) }
})
const classifiedAfter = after.map((item) => {
  const classification = classify(item, false)
  return { ...item, classification, risk: risk(item, classification) }
})

function count(items, key) {
  return items.filter((item) => item.classification === key).length
}

function render(title, items, includeResolution) {
  const counts = ['S1', 'S2', 'N1', 'N2', 'N3', 'N4'].map((key) => `- ${key}: ${count(items, key)}`).join('\n')
  const rows = items
    .map((item) => {
      const resolution = includeResolution ? ` | ${item.fixed ? 'FIXED' : 'RETAINED'}` : ''
      return `| ${item.rule} | ${item.file} | ${item.line} | ${item.active ? 'ACTIVE' : 'TEST/TOOLING'} | ${item.active ? 'YES' : 'NO'} | ${item.risk.replaceAll('|', '\\|')} | ${item.classification}${resolution} |`
    })
    .join('\n')
  return `# ${title}\n\nMission: \`MELEGA-DEX-LINT-SEMANTIC-SAFETY-01\`\n\nCandidate findings: **${items.length}**\n\n${counts}\n\n| Rule | File | Line | Scope | Runtime reachable | Risk | Classification${includeResolution ? ' / resolution' : ''} |\n| --- | --- | ---: | --- | --- | --- | --- |\n${rows}\n`
}

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(path.join(outputDirectory, 'SEMANTIC_BEFORE.md'), render('Semantic lint inventory — before', classifiedBefore, true))
fs.writeFileSync(path.join(outputDirectory, 'SEMANTIC_AFTER.md'), render('Semantic lint inventory — after', classifiedAfter, false))
fs.writeFileSync(
  path.join(outputDirectory, 'SEMANTIC_COUNTS.json'),
  `${JSON.stringify({
    reviewed: classifiedBefore.length,
    before: Object.fromEntries(['S1', 'S2', 'N1', 'N2', 'N3', 'N4'].map((key) => [key, count(classifiedBefore, key)])),
    after: Object.fromEntries(['S1', 'S2', 'N1', 'N2', 'N3', 'N4'].map((key) => [key, count(classifiedAfter, key)])),
  }, null, 2)}\n`,
)
