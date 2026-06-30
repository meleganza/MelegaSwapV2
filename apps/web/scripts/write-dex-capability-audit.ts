import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeDexCapabilityAudit } from '../src/lib/dex-capability-audit'

const outDir = resolve(__dirname, '../public/registry/capabilities')
mkdirSync(outDir, { recursive: true })

const manifest = serializeDexCapabilityAudit()
writeFileSync(resolve(outDir, 'dex-capability-audit.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/capabilities/dex-capability-audit.json')
