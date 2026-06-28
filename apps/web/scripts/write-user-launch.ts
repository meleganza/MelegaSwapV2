import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { resolveUserLaunchReadModel, serializeUserLaunchManifest } from '../src/lib/user-launch'

const outDir = resolve(__dirname, '../public/registry/launch')
mkdirSync(outDir, { recursive: true })

const model = resolveUserLaunchReadModel()
const manifest = serializeUserLaunchManifest(model)

writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/launch/index.json')
