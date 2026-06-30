import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeEconomicOrchestratorManifest } from '../src/lib/economic-orchestrator'

const outDir = resolve(__dirname, '../public/registry/orchestrator')
mkdirSync(outDir, { recursive: true })

const manifest = serializeEconomicOrchestratorManifest()
writeFileSync(resolve(outDir, 'index.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/orchestrator/index.json')
