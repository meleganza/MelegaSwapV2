import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeHomepageEntryManifest } from '../src/lib/homepage-entry'

const outDir = resolve(__dirname, '../public/registry/homepage')
mkdirSync(outDir, { recursive: true })

const manifest = serializeHomepageEntryManifest()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/homepage/index.json')
