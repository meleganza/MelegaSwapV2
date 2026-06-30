import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeRealEventIntakeManifest } from '../src/lib/real-event-intake'

const outDir = resolve(__dirname, '../public/registry/intake')
mkdirSync(outDir, { recursive: true })

const manifest = serializeRealEventIntakeManifest()
writeFileSync(resolve(outDir, 'real-event-intake.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/intake/real-event-intake.json')
