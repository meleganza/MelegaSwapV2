import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeReviewDecisionEventManifest } from '../src/lib/review-decision-events'

const outDir = resolve(__dirname, '../public/registry/review')
mkdirSync(outDir, { recursive: true })

const manifest = serializeReviewDecisionEventManifest()
writeFileSync(resolve(outDir, 'decision-events.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/review/decision-events.json')
