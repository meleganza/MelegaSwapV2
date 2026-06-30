import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeCivilizationDryRunManifest } from '../src/lib/civilization-dry-run'

const outDir = resolve(__dirname, '../public/registry/dry-runs')
mkdirSync(outDir, { recursive: true })

const manifest = serializeCivilizationDryRunManifest()
writeFileSync(
  resolve(outDir, 'civilization-dry-run.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
console.log('Wrote public/registry/dry-runs/civilization-dry-run.json')
