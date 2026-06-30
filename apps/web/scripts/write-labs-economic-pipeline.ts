import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeLabsEconomicPipelineManifest } from '../src/lib/labs-economic-pipeline'

const outDir = resolve(__dirname, '../public/registry/pipeline')
mkdirSync(outDir, { recursive: true })

const manifest = serializeLabsEconomicPipelineManifest()
writeFileSync(resolve(outDir, 'labs-economic-pipeline.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/pipeline/labs-economic-pipeline.json')
