/**
 * Regenerate civilization-router-contract.json using in-repo builder (no fabricated addresses).
 */
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { buildCivilizationRouterContract } from '../../src/lib/melega-smart-router/civilization-router/buildCivilizationRouterContract'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outPath = path.resolve(__dirname, '../../public/registry/smart-router/civilization-router-contract.json')

const contract = buildCivilizationRouterContract()
writeFileSync(outPath, `${JSON.stringify(contract, null, 2)}\n`)

console.log(
  JSON.stringify(
    {
      ok: true,
      action: 'regenerate-civilization-router-contract',
      wrapperAddress: contract.wrapperAddress,
      path: outPath,
    },
    null,
    2,
  ),
)
