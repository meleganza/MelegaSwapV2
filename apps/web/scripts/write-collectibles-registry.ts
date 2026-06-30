import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { getAllCollectibles } from '../src/registry/collectibles/getAllCollectibles'
import {
  serializeCollectibleManifest,
  serializeCollectiblesRegistryIndex,
  serializeCollectiblesWellKnown,
  stripCollectibleManifest,
} from '../src/registry/collectibles/collectible-manifest'

const outDir = resolve(__dirname, '../public/registry/collectibles')
const wellKnownDir = resolve(__dirname, '../public/.well-known')

mkdirSync(outDir, { recursive: true })
mkdirSync(wellKnownDir, { recursive: true })

const index = serializeCollectiblesRegistryIndex()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(index, null, 2)}\n`)

getAllCollectibles().forEach((record) => {
  const manifest = stripCollectibleManifest(serializeCollectibleManifest(record))
  writeFileSync(resolve(outDir, `${record.slug}.json`), `${JSON.stringify(manifest, null, 2)}\n`)
})

const wellKnown = serializeCollectiblesWellKnown()
writeFileSync(
  resolve(wellKnownDir, 'melega-dex-collectibles.json'),
  `${JSON.stringify(wellKnown, null, 2)}\n`,
)

console.log('Wrote public/registry/collectibles/index.json')
console.log(`Wrote ${getAllCollectibles().length} collectible slug manifests`)
console.log('Wrote public/.well-known/melega-dex-collectibles.json')
