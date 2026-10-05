#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import ts from 'typescript'

const repoRoot = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..')
const webRoot = path.join(repoRoot, 'apps/web')
const sourceRoot = path.join(webRoot, 'src')
const tsconfigPath = path.join(webRoot, 'tsconfig.json')

const entrypoints = [
  'src/pages/_app.tsx',
  'src/pages/_document.tsx',
  'src/pages/_error.tsx',
  'src/middleware.ts',
  'src/pages/index.tsx',
  'src/pages/swap/index.tsx',
  'src/pages/liquidity.tsx',
  'src/pages/farms/index.tsx',
  'src/pages/pools/index.tsx',
  'src/pages/bridge/index.tsx',
  'src/pages/projects/index.tsx',
  'src/pages/list/index.tsx',
  'src/pages/portfolio/index.tsx',
  'src/pages/project-hq/[slug].tsx',
  'src/pages/docs/index.tsx',
  'src/pages/audit/index.tsx',
  'src/pages/support/index.tsx',
].map((file) => path.join(webRoot, file))

function readConfig() {
  const configFile = ts.readConfigFile(tsconfigPath, ts.sys.readFile)
  if (configFile.error) throw new Error(ts.flattenDiagnosticMessageText(configFile.error.messageText, '\n'))
  return ts.parseJsonConfigFileContent(configFile.config, ts.sys, webRoot, undefined, tsconfigPath)
}

const parsedConfig = readConfig()
const resolutionHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,
  realpath: ts.sys.realpath,
  directoryExists: ts.sys.directoryExists,
  getCurrentDirectory: () => webRoot,
  getDirectories: ts.sys.getDirectories,
}

function isProjectSource(file) {
  const normalized = path.normalize(file)
  return (
    (normalized.startsWith(`${path.normalize(sourceRoot)}${path.sep}`) ||
      normalized.startsWith(`${path.normalize(path.join(repoRoot, 'packages'))}${path.sep}`)) &&
    !normalized.includes(`${path.sep}node_modules${path.sep}`) &&
    /\.[cm]?[jt]sx?$/.test(normalized)
  )
}

function moduleSpecifiers(sourceFile) {
  const values = []
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteralLike(node.moduleSpecifier)
    ) {
      values.push(node.moduleSpecifier.text)
    } else if (
      ts.isCallExpression(node) &&
      node.arguments.length === 1 &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require')) &&
      ts.isStringLiteralLike(node.arguments[0])
    ) {
      values.push(node.arguments[0].text)
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return values
}

function apiRoutePattern(file) {
  const relative = path.relative(path.join(sourceRoot, 'pages/api'), file).replace(/\\/g, '/').replace(/\.[^.]+$/, '')
  const segments = relative.split('/').map((segment) => {
    if (/^\[\.\.\..+\]$/.test(segment)) return '.+'
    if (/^\[.+\]$/.test(segment)) return '[^/]+'
    return segment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  })
  return new RegExp(`^/api/${segments.join('/')}/?(?:[?#].*)?$`)
}

const apiRoutes = parsedConfig.fileNames
  .filter((file) => file.startsWith(path.join(sourceRoot, 'pages/api')) && isProjectSource(file))
  .map((file) => ({ file: path.normalize(file), pattern: apiRoutePattern(file) }))

function referencedApiRoutes(sourceFile) {
  const matches = new Set()
  const visit = (node) => {
    if (ts.isStringLiteralLike(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
      const value = node.text
      if (value.startsWith('/api/')) {
        for (const route of apiRoutes) if (route.pattern.test(value)) matches.add(route.file)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(sourceFile)
  return [...matches]
}

const active = new Set()
const queue = entrypoints.map(path.normalize)
while (queue.length) {
  const file = queue.shift()
  if (!isProjectSource(file) || active.has(file) || !fs.existsSync(file)) continue
  active.add(file)
  const text = fs.readFileSync(file, 'utf8')
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true)
  const dependencies = referencedApiRoutes(sourceFile)
  for (const specifier of moduleSpecifiers(sourceFile)) {
    const resolution = ts.resolveModuleName(specifier, file, parsedConfig.options, resolutionHost).resolvedModule
    if (resolution?.resolvedFileName && isProjectSource(resolution.resolvedFileName)) {
      dependencies.push(path.normalize(resolution.resolvedFileName))
    }
  }
  for (const dependency of dependencies) if (!active.has(dependency)) queue.push(dependency)
}

const diagnosticsPath = process.argv[2] ? path.resolve(process.argv[2]) : null
if (!diagnosticsPath || !fs.existsSync(diagnosticsPath)) {
  throw new Error('Usage: node scripts/stability/classify-active-production.mjs <tsc-output.txt> [output-directory]')
}
const outputDirectory = process.argv[3]
  ? path.resolve(process.argv[3])
  : path.join(repoRoot, 'docs/stability/active-code-debt')
fs.mkdirSync(outputDirectory, { recursive: true })

const diagnosticPattern = /^(.*?)\((\d+),(\d+)\): error (TS\d+): (.*)$/
const diagnostics = fs
  .readFileSync(diagnosticsPath, 'utf8')
  .split(/\r?\n/)
  .map((line) => {
    const match = line.match(diagnosticPattern)
    if (!match) return null
    const absoluteFile = path.normalize(path.resolve(webRoot, match[1]))
    return { line, absoluteFile, relativeFile: path.relative(repoRoot, absoluteFile).replace(/\\/g, '/') }
  })
  .filter(Boolean)

const activeDiagnostics = diagnostics.filter(({ absoluteFile }) => active.has(absoluteFile))
const inactiveDiagnostics = diagnostics.filter(({ absoluteFile }) => !active.has(absoluteFile))
const categoryC = inactiveDiagnostics.filter(({ relativeFile }) =>
  /(?:^|\/)(?:__tests__|__fixtures__)(?:\/|$)|\.(?:test|spec)\.[cm]?[jt]sx?$/.test(relativeFile),
)
const categoryCSet = new Set(categoryC.map(({ line }) => line))
const categoryD = inactiveDiagnostics.filter(({ line }) => !categoryCSet.has(line))

function topDirectories(items) {
  const counts = new Map()
  for (const { relativeFile } of items) {
    const parts = relativeFile.split('/')
    const directory = parts.slice(0, Math.min(4, Math.max(1, parts.length - 1))).join('/')
    counts.set(directory, (counts.get(directory) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([directory, diagnostics]) => ({ directory, diagnostics }))
    .sort((a, b) => b.diagnostics - a.diagnostics || a.directory.localeCompare(b.directory))
    .slice(0, 10)
}

const relativeActiveFiles = [...active]
  .map((file) => path.relative(repoRoot, file).replace(/\\/g, '/'))
  .sort()

fs.writeFileSync(path.join(outputDirectory, 'ACTIVE_PRODUCTION_FILES.txt'), `${relativeActiveFiles.join('\n')}\n`)
fs.writeFileSync(
  path.join(outputDirectory, process.env.ACTIVE_DIAGNOSTICS_FILE || 'ACTIVE_DIAGNOSTICS_BEFORE.txt'),
  activeDiagnostics.length ? `${activeDiagnostics.map(({ line }) => line).join('\n')}\n` : '',
)
fs.writeFileSync(
  path.join(outputDirectory, 'CLASSIFICATION.json'),
  `${JSON.stringify(
    {
      classifierVersion: 1,
      entrypoints: entrypoints.map((file) => path.relative(repoRoot, file).replace(/\\/g, '/')),
      activeProductionFiles: relativeActiveFiles.length,
      repositoryDiagnostics: diagnostics.length,
      activeProductionDiagnostics: activeDiagnostics.length,
      remainingCategoryC: categoryC.length,
      remainingCategoryD: categoryD.length,
      remainingCategoryCTopDirectories: topDirectories(categoryC),
      remainingCategoryDTopDirectories: topDirectories(categoryD),
    },
    null,
    2,
  )}\n`,
)

console.log(
  JSON.stringify({
    activeProductionFiles: relativeActiveFiles.length,
    repositoryDiagnostics: diagnostics.length,
    activeProductionDiagnostics: activeDiagnostics.length,
    remainingCategoryC: categoryC.length,
    remainingCategoryD: categoryD.length,
    outputDirectory,
  }),
)
