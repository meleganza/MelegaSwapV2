import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { resolveSmartExecutionReadModel, serializeSmartExecutionManifest } from '../src/lib/smart-execution'

const outDir = resolve(__dirname, '../public/registry/execution')
mkdirSync(outDir, { recursive: true })

const model = resolveSmartExecutionReadModel()
const manifest = serializeSmartExecutionManifest(model)

writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/execution/index.json')
