import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const srcDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src')
const forbidden = /@pancakeswap\/sdk|feeSchedule|fee-schedule|melegaChainRegistry|melegaDexAdapter|apps\/web|from ['"]config\/|from ['"]lib\//

const offenders = []
for (const file of readdirSync(srcDir)) {
  if (!file.endsWith('.ts')) continue
  const imports = readFileSync(path.join(srcDir, file), 'utf8')
    .split('\n')
    .filter((line) => /^\s*import\b/.test(line))
    .join('\n')
  if (forbidden.test(imports)) offenders.push(file)
}

if (offenders.length) {
  console.error(`package closure pulled a forbidden import: ${offenders.join(', ')}`)
  process.exit(1)
}

const addresses = readFileSync(path.join(srcDir, 'melegaAddresses.ts'), 'utf8')
if (!addresses.includes("'0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C'")) {
  console.error('MELEGA_BNB_FACTORY drifted')
  process.exit(1)
}
if (!addresses.includes("'melega-dex'")) {
  console.error('MELEGA_DEX_VENUE_ID drifted')
  process.exit(1)
}

console.log('smartswap-v2-prepare closure: no Pancake SDK, fee schedule, or apps/web import')
