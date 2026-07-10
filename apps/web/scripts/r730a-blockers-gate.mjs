#!/usr/bin/env node
/** R730A-BLOCKERS — runtime blocker closure gate. */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '..')
const OUT = path.resolve(__dirname, '../../../docs/runtime/R730A_BLOCKERS_GATE.json')

const LEGACY_SUBGRAPH = 'https://proxy-worker.pancake-swap.workers.dev/bsc-exchange'
const BLOCKED = 'BLOCKED_SUBGRAPH_NOT_DEPLOYED'

async function probeSubgraph(url) {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        origin: 'https://pancakeswap.finance',
      },
      body: JSON.stringify({
        query: `query { swaps(first: 1, orderBy: timestamp, orderDirection: desc) { id timestamp } mints(first: 1) { id timestamp } burns(first: 1) { id timestamp } }`,
      }),
    })
    const json = await res.json().catch(() => null)
    const swaps = json?.data?.swaps?.length ?? 0
    const mints = json?.data?.mints?.length ?? 0
    const burns = json?.data?.burns?.length ?? 0
    return { ok: res.ok && swaps + mints + burns > 0, status: res.status, swaps, mints, burns, error: json?.error ?? json?.status }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'network_error' }
  }
}

async function main() {
  const envExample = fs.readFileSync(path.join(WEB, '.env.example'), 'utf8')
  const endpointsSrc = fs.readFileSync(path.join(WEB, 'src/config/constants/endpoints.ts'), 'utf8')
  const whaleSrc = fs.readFileSync(path.join(WEB, 'src/lib/runtime-indexing/whaleIndexerConfig.ts'), 'utf8')
  const holderSrc = fs.readFileSync(path.join(WEB, 'src/lib/holder-count/resolveHolderMachinePayload.ts'), 'utf8')
  const poolGateSrc = fs.readFileSync(
    path.join(WEB, 'src/views/PoolsStudio/poolsRuntime/buildPoolGateReport.ts'),
    'utf8',
  )

  const melegaUrl = process.env.NEXT_PUBLIC_MELEGA_SUBGRAPH_URL?.trim()
  const legacyProbe = await probeSubgraph(LEGACY_SUBGRAPH)
  const configuredEndpoint = melegaUrl || LEGACY_SUBGRAPH

  const report = {
    timestamp: new Date().toISOString(),
    subgraph: {
      configuredEndpoint,
      melegaNativeConfigured: Boolean(melegaUrl),
      legacyFallbackEndpoint: LEGACY_SUBGRAPH,
      blockerCode: melegaUrl ? null : BLOCKED,
      legacyProbe,
      endpointsUsesEnvOverride: endpointsSrc.includes('NEXT_PUBLIC_MELEGA_SUBGRAPH_URL'),
    },
    bscscan: {
      localKeyConfigured: Boolean(process.env.NEXT_PUBLIC_BSCSCAN_API_KEY),
      envExampleHasKey: envExample.includes('NEXT_PUBLIC_BSCSCAN_API_KEY='),
      machinePayloadFields: ['holder_source', 'holder_status', 'holder_reason'].every((f) =>
        holderSrc.includes(f),
      ),
    },
    pools: {
      gateAuditModule: poolGateSrc.includes('buildPoolGateReport'),
      gateCategories: ['valid_live', 'ended', 'needs_funding', 'missing_apr', 'missing_reward_budget'].every((c) =>
        poolGateSrc.includes(c),
      ),
    },
    whale: {
      code: whaleSrc.includes('WHALE_INDEXER_NOT_CONFIGURED'),
      expectedSchema: whaleSrc.includes('expected_schema'),
      requiredSource: whaleSrc.includes('required_source'),
    },
    envExample: {
      bscscan: envExample.includes('NEXT_PUBLIC_BSCSCAN_API_KEY='),
      melegaSubgraph: envExample.includes('NEXT_PUBLIC_MELEGA_SUBGRAPH_URL='),
    },
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, JSON.stringify(report, null, 2))

  const failures = []
  if (!melegaUrl && report.subgraph.blockerCode !== BLOCKED) failures.push('subgraph blocker missing')
  if (!report.envExample.bscscan) failures.push('.env.example missing BSCSCAN key')
  if (!report.bscscan.machinePayloadFields) failures.push('holder machine payload fields missing')
  if (!report.pools.gateAuditModule) failures.push('pool gate audit module missing')
  if (!report.whale.code) failures.push('whale indexer not classified')

  console.log(JSON.stringify(report, null, 2))
  if (failures.length) {
    console.error('FAIL:', failures.join('; '))
    process.exit(1)
  }
  console.log('R730A_BLOCKERS_GATE PASS')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
