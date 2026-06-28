import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeLegacyIloRetirementManifest } from '../src/lib/legacy-surfaces'

const outDir = resolve(__dirname, '../public/registry/legacy')
mkdirSync(outDir, { recursive: true })

const manifest = serializeLegacyIloRetirementManifest()
writeFileSync(resolve(outDir, 'ilo-retirement.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/legacy/ilo-retirement.json')
