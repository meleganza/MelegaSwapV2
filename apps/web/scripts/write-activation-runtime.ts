import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { resolveActivationSession, serializeActivationRuntime } from '../src/lib/economic-runtime'

const outDir = resolve(__dirname, '../public/registry/activation')
mkdirSync(outDir, { recursive: true })

const session = resolveActivationSession()
const manifest = serializeActivationRuntime(session)

writeFileSync(resolve(outDir, 'runtime.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/activation/runtime.json')
