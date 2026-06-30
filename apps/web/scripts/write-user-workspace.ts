import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeUserWorkspaceManifest } from '../src/lib/user-workspace'

const outDir = resolve(__dirname, '../public/registry/workspace')
mkdirSync(outDir, { recursive: true })

const manifest = serializeUserWorkspaceManifest()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/workspace/index.json')
