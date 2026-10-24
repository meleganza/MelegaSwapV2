const path = require('path')
const root = path.resolve(__dirname, '../../apps/web')
const ts = require(require.resolve('typescript', { paths: [root] }))
const files = ['src/views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx', 'src/views/FarmsStudio/FarmsStudioGlobalStyle.tsx'].map(f => path.join(root, f))
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile)
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root)
const program = ts.createProgram(files, { ...parsed.options, noEmit: true, incremental: false })
const all = ts.getPreEmitDiagnostics(program)
const own = all.filter(d => !d.file || files.includes(d.file.fileName))
const host = { getCanonicalFileName: f => f, getCurrentDirectory: () => root, getNewLine: () => '\n' }
console.log(ts.formatDiagnostics(own, host))
console.log(JSON.stringify({ touchedDiagnostics: own.length, dependencyDiagnostics: all.length - own.length }))
process.exitCode = own.length ? 1 : 0
