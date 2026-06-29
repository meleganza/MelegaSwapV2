import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeLabsRuntimeManifest } from '../src/lib/labs-runtime'

const outDir = resolve(__dirname, '../public/registry/runtime')
mkdirSync(outDir, { recursive: true })

const manifest = serializeLabsRuntimeManifest()
writeFileSync(resolve(outDir, 'labs-runtime.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/runtime/labs-runtime.json')
