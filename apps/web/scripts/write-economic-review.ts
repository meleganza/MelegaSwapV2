import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeEconomicReviewManifest } from '../src/lib/economic-review'

const outDir = resolve(__dirname, '../public/registry/review')
mkdirSync(outDir, { recursive: true })

const manifest = serializeEconomicReviewManifest()
writeFileSync(resolve(outDir, 'economic-review.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/review/economic-review.json')
