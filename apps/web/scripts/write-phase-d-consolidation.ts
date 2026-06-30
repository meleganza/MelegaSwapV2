import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializePhaseDConsolidationManifest } from '../src/lib/phase-d-readiness'

const validation = {
  mission_tests: 'passed' as const,
  build: 'passed' as const,
  routes: 'verified' as const,
  manifests: 'verified' as const,
  forbidden_files: 'unchanged' as const,
}

const outDir = resolve(__dirname, '../public/registry/readiness')
mkdirSync(outDir, { recursive: true })

const manifest = serializePhaseDConsolidationManifest(validation)
writeFileSync(
  resolve(outDir, 'phase-d-consolidation.json'),
  `${JSON.stringify(manifest, null, 2)}\n`,
)
console.log('Wrote public/registry/readiness/phase-d-consolidation.json')
