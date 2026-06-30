import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeMainnetReadinessManifest } from '../src/lib/mainnet-readiness'

const outDir = resolve(__dirname, '../public/registry/readiness')
mkdirSync(outDir, { recursive: true })

const manifest = serializeMainnetReadinessManifest()
writeFileSync(resolve(outDir, 'mainnet-gate.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/readiness/mainnet-gate.json')
