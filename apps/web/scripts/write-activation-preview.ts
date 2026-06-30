import { writeFileSync } from 'fs'
import { resolve } from 'path'
import { resolveLabsActivationPreview, serializeActivationManifest } from '../src/lib/economic-activation'

const out = resolve(__dirname, '../public/registry/activation/preview.json')
writeFileSync(out, `${JSON.stringify(serializeActivationManifest(resolveLabsActivationPreview()), null, 2)}\n`)
console.log('wrote', out)
