import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeEconomicIdentityManifest } from '../src/lib/economic-identity'

const outDir = resolve(__dirname, '../public/registry/identity')
mkdirSync(outDir, { recursive: true })

const manifest = serializeEconomicIdentityManifest()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/identity/index.json')
