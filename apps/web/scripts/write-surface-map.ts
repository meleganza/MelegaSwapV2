import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeSurfaceMapManifest } from '../src/lib/surface-map'

const outDir = resolve(__dirname, '../public/registry/surfaces')
mkdirSync(outDir, { recursive: true })

const manifest = serializeSurfaceMapManifest()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/surfaces/index.json')
