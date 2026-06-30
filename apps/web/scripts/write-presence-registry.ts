import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { getAllPresence } from '../src/registry/presence/getAllPresence'
import {
  serializePresenceManifest,
  serializePresenceRegistryIndex,
  serializePresenceWellKnown,
  stripPresenceManifest,
} from '../src/registry/presence/presence-manifest'

const outDir = resolve(__dirname, '../public/registry/presence')
const wellKnownDir = resolve(__dirname, '../public/.well-known')

mkdirSync(outDir, { recursive: true })
mkdirSync(wellKnownDir, { recursive: true })

const index = serializePresenceRegistryIndex()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

getAllPresence().forEach((record) => {
  const manifest = stripPresenceManifest(serializePresenceManifest(record))
  writeFileSync(resolve(outDir, `${record.slug}.json`), `${JSON.stringify(manifest, null, 2)}\n`)
})

const wellKnown = serializePresenceWellKnown()
writeFileSync(
  resolve(wellKnownDir, 'melega-dex-presence.json'),
  `${JSON.stringify(wellKnown, null, 2)}\n`,
)

console.log('Wrote public/registry/presence/index.json')
console.log(`Wrote ${getAllPresence().length} presence slug manifests`)
console.log('Wrote public/.well-known/melega-dex-presence.json')
