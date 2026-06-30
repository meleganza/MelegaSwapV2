import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeEconomicSubmissionManifest } from '../src/lib/economic-submission'

const outDir = resolve(__dirname, '../public/registry/submission')
mkdirSync(outDir, { recursive: true })

const manifest = serializeEconomicSubmissionManifest()
writeFileSync(resolve(outDir, 'economic-submission.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/submission/economic-submission.json')
