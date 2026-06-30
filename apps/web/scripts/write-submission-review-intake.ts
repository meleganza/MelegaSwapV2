import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeSubmissionReviewIntakeManifest } from '../src/lib/submission-review-intake'

const outDir = resolve(__dirname, '../public/registry/bridges')
mkdirSync(outDir, { recursive: true })

const manifest = serializeSubmissionReviewIntakeManifest()
writeFileSync(
  resolve(outDir, 'submission-review-intake.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
console.log('Wrote public/registry/bridges/submission-review-intake.json')
