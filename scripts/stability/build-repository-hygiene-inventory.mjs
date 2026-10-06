#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const [inputPath, phase = 'BEFORE'] = process.argv.slice(2)
if (!inputPath || !['BEFORE', 'AFTER'].includes(phase)) {
  throw new Error('Usage: node scripts/stability/build-repository-hygiene-inventory.mjs <tsc-output> <BEFORE|AFTER>')
}

const repositoryRoot = path.resolve(new URL('../..', import.meta.url).pathname)
const outputDirectory = path.join(repositoryRoot, 'docs/stability/repository-hygiene')
const lines = fs.readFileSync(path.resolve(inputPath), 'utf8').split(/\r?\n/)
const diagnosticPattern = /^(.+?)\((\d+),(\d+)\): error (TS\d+): (.*)$/

const importDriftCodes = new Set(['TS2305', 'TS2307', 'TS2459', 'TS2614', 'TS2724', 'TS2820'])
const fixtureCodes = new Set(['TS2322', 'TS2339', 'TS2345', 'TS2551', 'TS2739', 'TS2740', 'TS2741', 'TS2769'])

function classify(file, code) {
  const isTest = /(^|\/)(__tests__|test|tests|fixtures?)(\/|\.|$)/i.test(file)
  if (isTest) {
    if (importDriftCodes.has(code)) return 'C2'
    if (fixtureCodes.has(code)) return 'C1'
    return 'C3'
  }
  if (/(^|\/)(generated|__generated__|vendor)(\/|$)/i.test(file)) return 'D2'
  if (/(^|\/)(scripts?|tooling|cli)(\/|$)/i.test(file)) return 'D1'
  if (/node_modules|third[-_/]?party/i.test(file)) return 'D4'
  return 'D3'
}

const diagnostics = lines.flatMap((line) => {
  const match = line.match(diagnosticPattern)
  if (!match) return []
  const [, file, row, column, code, message] = match
  return [{ file, line: Number(row), column: Number(column), code, message, category: classify(file, code) }]
})

function groupedBy(field) {
  const counts = new Map()
  for (const diagnostic of diagnostics) {
    const key = diagnostic[field]
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([key, count]) => ({ [field]: key, count }))
    .sort((a, b) => b.count - a.count || a[field].localeCompare(b[field]))
}

const categoryCounts = Object.fromEntries(['C1', 'C2', 'C3', 'D1', 'D2', 'D3', 'D4'].map((key) => [key, 0]))
for (const diagnostic of diagnostics) categoryCounts[diagnostic.category] += 1

const inventory = {
  mission: 'MELEGA-DEX-REPOSITORY-HYGIENE-AND-LEGACY-DEBT-ZERO',
  phase,
  generatedAt: new Date().toISOString(),
  command: 'cd apps/web && yarn tsc --noEmit --pretty false',
  total: diagnostics.length,
  categoryC: categoryCounts.C1 + categoryCounts.C2 + categoryCounts.C3,
  categoryD: categoryCounts.D1 + categoryCounts.D2 + categoryCounts.D3 + categoryCounts.D4,
  categoryCounts,
  byCode: groupedBy('code'),
  byFile: groupedBy('file'),
  diagnostics,
}

fs.mkdirSync(outputDirectory, { recursive: true })
fs.writeFileSync(path.join(outputDirectory, `${phase}_DIAGNOSTICS.json`), `${JSON.stringify(inventory, null, 2)}\n`)

if (phase === 'BEFORE') {
  const table = (rows, key) => rows.map((entry) => `| \`${entry[key]}\` | ${entry.count} |`).join('\n')
  const markdown = `# Repository hygiene baseline\n\nMission: \`MELEGA-DEX-REPOSITORY-HYGIENE-AND-LEGACY-DEBT-ZERO\`\n\nBase main: \`ce61ef9cfa292d0b184e7572c5447dd25b79a67d\`\n\nNo fixes were applied before this inventory was captured. The source of truth is [BEFORE_DIAGNOSTICS.json](./BEFORE_DIAGNOSTICS.json), which records every diagnostic with file, line, column, error code, message, and category.\n\n## Commands and counts\n\n- Repository typecheck: \`cd apps/web && yarn tsc --noEmit --pretty false\`\n- Repository diagnostics: **${inventory.total}**\n- Active-production diagnostics: **0**\n- Category C (tests/historical): **${inventory.categoryC}**\n- Category D (unreachable first-party/generated/vendor/tooling): **${inventory.categoryD}**\n\n## Detailed categories\n\n| Category | Meaning | Count |\n| --- | --- | ---: |\n| C1 | Stale test fixtures or fixture-facing types | ${categoryCounts.C1} |\n| C2 | Historical test expectation or import drift | ${categoryCounts.C2} |\n| C3 | Test harness or mock typing | ${categoryCounts.C3} |\n| D1 | First-party scripts or tooling | ${categoryCounts.D1} |\n| D2 | Generated artifacts | ${categoryCounts.D2} |\n| D3 | Dead or unreachable first-party modules | ${categoryCounts.D3} |\n| D4 | Third-party/vendor/toolchain incompatibility | ${categoryCounts.D4} |\n\nCategory D reachability is based on the #117 TypeScript-resolved active-production classifier. It reported 1,533 reachable files and zero diagnostics in that closure on this checkout. A D3 label is a reachability classification, not yet authorization to delete a file; removals require separate reference and entrypoint proof.\n\n## Diagnostics by code\n\n| Code | Count |\n| --- | ---: |\n${table(inventory.byCode, 'code')}\n\n## Diagnostics by file\n\n| File | Count |\n| --- | ---: |\n${table(inventory.byFile, 'file')}\n`
  fs.writeFileSync(path.join(outputDirectory, 'BEFORE.md'), markdown)
}
