// Compare diagnostics in changed production files with the same files at HEAD.
// ES2020 is used because existing dependencies contain BigInt expressions.
const ts = require('typescript')
const path = require('path')
const fs = require('fs')
const { execFileSync } = require('child_process')
const repo = path.resolve(__dirname, '../../..')
const root = path.join(repo, 'apps/web')
const base = 'a6e178c2ce6be73c38faf67a5a8fe0665f1ab17e'
const names = execFileSync('git', ['diff', base, '--name-only', '--', 'apps/web/src'], { cwd: repo, encoding: 'utf8' }).trim().split('\n').filter(f => /\.tsx?$/.test(f) && !f.includes('__tests__'))
const files = names.map(f => path.join(repo, f))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const options = { ...parsed.options, target: ts.ScriptTarget.ES2020, noEmit: true, incremental: false }
function check(baseline) {
  const host = ts.createCompilerHost(options)
  const read = host.readFile.bind(host)
  const old = new Map(baseline ? names.map(f => [path.join(repo, f), execFileSync('git', ['show', `${base}:${f}`], { cwd: repo, encoding: 'utf8' })]) : [])
  host.readFile = f => old.has(f) ? old.get(f) : read(f)
  const program = ts.createProgram(files, options, host)
  const diagnostics = ts.getPreEmitDiagnostics(program)
  return { total: diagnostics.length, touched: diagnostics.filter(d => !d.file || files.includes(d.file.fileName)).map(d => ({ file: d.file ? path.relative(repo, d.file.fileName) : null, code: d.code, message: ts.flattenDiagnosticMessageText(d.messageText, '\n') })) }
}
const baseline = check(true), current = check(false)
const introduced = current.touched.filter(d => !baseline.touched.some(b => JSON.stringify(b) === JSON.stringify(d)))
const result = { target: 'ES2020', files: names, baseline, current, introduced }
fs.writeFileSync(path.join(__dirname, 'evidence/typecheck.json'), JSON.stringify(result, null, 2))
console.log(JSON.stringify(result, null, 2))
process.exitCode = introduced.length ? 1 : 0
