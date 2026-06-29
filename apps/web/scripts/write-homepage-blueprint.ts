import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeHomepageBlueprintManifest } from '../src/lib/homepage-blueprint'

const outDir = resolve(__dirname, '../public/registry/blueprints')
mkdirSync(outDir, { recursive: true })

const manifest = serializeHomepageBlueprintManifest()
writeFileSync(resolve(outDir, 'homepage-entry-point.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/blueprints/homepage-entry-point.json')
