import { writeFileSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import { serializeAiAgentExperienceManifest } from '../src/lib/experience-audit'

const outDir = resolve(__dirname, '../public/registry/audit')
mkdirSync(outDir, { recursive: true })

const manifest = serializeAiAgentExperienceManifest()
writeFileSync(resolve(outDir, 'ai-agent-experience.json'), `${JSON.stringify(manifest, null, 2)}\n`)
console.log('Wrote public/registry/audit/ai-agent-experience.json')
