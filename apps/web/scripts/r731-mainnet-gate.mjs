#!/usr/bin/env node
/** R731 — Mainnet blockers closure gate. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const ROOT = path.resolve(__dirname, '../../..')
const OUT = path.join(ROOT, 'docs/runtime/R731_MAINNET_GATE.json')
const LEGACY = 'https://proxy-worker.pancake-swap.workers.dev/bsc-exchange'
const BLOCKED = 'BLOCKED_SUBGRAPH_NOT_DEPLOYED'
const MARCO = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

async function probeLegacy() {
  try {
    const res = await fetch(LEGACY, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', origin: 'https://pancakeswap.finance' },
      body: JSON.stringify({
        query: 'query { swaps(first:1){id timestamp} mints(first:1){id} burns(first:1){id} }',
      }),
    })
    const json = await res.json().catch(() => null)
    return { ok: res.ok && Boolean(json?.data?.swaps?.length), status: res.status, body: json?.error ?? json?.status }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function probeMarcoHolders(apiKey) {
  if (!apiKey) return { skipped: true, reason: 'no_api_key' }
  try {
    const url = `https://api.bscscan.com/api?module=token&action=tokenholdercount&contractaddress=${MARCO}&apikey=${apiKey}`
    const res = await fetch(url)
    const json = await res.json()
    return {
      ok: json.status === '1' && json.result != null,
      status: json.status,
      message: json.message,
      count: json.result,
    }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

async function main() {
  const endpoints = fs.readFileSync(path.join(WEB, 'src/config/constants/endpoints.ts'), 'utf8')
  const envExample = fs.readFileSync(path.join(WEB, '.env.example'), 'utf8')
  const resolveSubgraph = fs.readFileSync(path.join(WEB, 'src/lib/runtime-indexing/resolveSubgraphEndpoint.ts'), 'utf8')
  const whale = fs.readFileSync(path.join(WEB, 'src/lib/runtime-indexing/whaleIndexerConfig.ts'), 'utf8')

  const melegaUrl = process.env.NEXT_PUBLIC_MELEGA_SUBGRAPH_URL?.trim()
  const bscKey = process.env.NEXT_PUBLIC_BSCSCAN_API_KEY?.trim()
  const legacyProbe = await probeLegacy()
  const marcoHolders = await probeMarcoHolders(bscKey)

  const report = {
    timestamp: new Date().toISOString(),
    verdict: 'PARTIAL',
    subgraph: {
      configured: Boolean(melegaUrl),
      url: melegaUrl || null,
      blockerWhenUnset: BLOCKED,
      legacyProxyDead: !legacyProbe.ok,
      legacyProbe,
      frontendUsesLegacyFallback: endpoints.includes('LEGACY_INFO_CLIENT') && endpoints.includes("INFO_CLIENT = MELEGA_SUBGRAPH_URL"),
      deploymentSpec: fs.existsSync(path.join(ROOT, 'docs/runtime/R731_MELEGA_SUBGRAPH_DEPLOYMENT_SPEC.md')),
    },
    bscscan: {
      localKeyConfigured: Boolean(bscKey),
      envExample: envExample.includes('NEXT_PUBLIC_BSCSCAN_API_KEY='),
      marcoHolderProbe: marcoHolders,
      checklist: fs.existsSync(path.join(ROOT, 'docs/runtime/R731_MAINNET_ENV_CHECKLIST.md')),
    },
    pools: {
      auditDoc: fs.existsSync(path.join(ROOT, 'docs/runtime/R731_POOL_GATE_AUDIT.md')),
      gateModule: fs.existsSync(path.join(WEB, 'src/views/PoolsStudio/poolsRuntime/buildPoolGateReport.ts')),
    },
    whale: {
      code: whale.includes('WHALE_INDEXER_NOT_DEPLOYED'),
      spec: fs.existsSync(path.join(ROOT, 'docs/runtime/R731_WHALE_INDEXER_SPEC.md')),
    },
  }

  if (melegaUrl && legacyProbe.ok === false) report.verdict = 'PARTIAL'
  if (!melegaUrl && !bscKey) report.verdict = 'PARTIAL'
  if (melegaUrl && marcoHolders.ok) report.verdict = 'PARTIAL'
  if (melegaUrl && marcoHolders.ok && report.pools.auditDoc) report.verdict = 'PASS'

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2))

  const failures = []
  if (endpoints.includes('|| LEGACY_INFO_CLIENT') || endpoints.includes('|| LEGACY')) {
    failures.push('INFO_CLIENT still falls back to legacy proxy')
  }
  if (!resolveSubgraph.includes(BLOCKED)) failures.push('missing BLOCKED_SUBGRAPH_NOT_DEPLOYED')
  if (!report.subgraph.deploymentSpec) failures.push('missing subgraph deployment spec')
  if (!report.bscscan.envExample) failures.push('missing BSCSCAN in env.example')
  if (!report.whale.code) failures.push('whale indexer not classified')

  console.log(JSON.stringify(report, null, 2))
  if (failures.length) {
    console.error('FAIL:', failures.join('; '))
    process.exit(1)
  }
  console.log(`R731_MAINNET_GATE ${report.verdict}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
