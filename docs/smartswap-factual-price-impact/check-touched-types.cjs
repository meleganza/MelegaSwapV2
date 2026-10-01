const path = require('path');
const root = path.resolve(__dirname, '../../apps/web');
const ts = require(require.resolve('typescript', { paths: [root] }));
const names = ['evmV2Quote.ts', 'certifiedVenues.ts', '__tests__/v2FactualPriceImpact.test.ts', '__tests__/v2FactualPriceImpactReadonly.test.ts'];
const files = names.map(n => path.join(root, 'src/lib/smartswap-universal-engine', n));
const config = ts.readConfigFile(path.join(root, 'tsconfig.json'), ts.sys.readFile);
const parsed = ts.parseJsonConfigFileContent(config.config, ts.sys, root);
// The project ES5 setting conflicts with existing BigInt code. Check the touched files and real
// imports against ES2020, reporting dependency diagnostics separately rather than hiding them.
const program = ts.createProgram(files, { ...parsed.options, target: ts.ScriptTarget.ES2020, noEmit: true, incremental: false });
const all = ts.getPreEmitDiagnostics(program);
const own = all.filter(d => !d.file || files.includes(d.file.fileName));
const host = { getCanonicalFileName: f => f, getCurrentDirectory: () => root, getNewLine: () => '\n' };
console.log(ts.formatDiagnostics(own, host));
console.log(JSON.stringify({ target: 'ES2020', checkedFiles: names, touchedDiagnostics: own.length, dependencyDiagnostics: all.length - own.length }));
process.exitCode = own.length ? 1 : 0;
