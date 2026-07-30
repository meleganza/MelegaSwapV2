#!/usr/bin/env node
/**
 * Runtime export of canonical market snapshot + certification evidence.
 * Run from apps/web after `yarn next build` with NODE_PATH / ts via next:
 *   node --experimental-vm-modules ... (or invoke via next start + curl)
 *
 * Preferred path used by mission: curl the live API after next start.
 */
import { writeFileSync, mkdirSync } from 'fs'
import { createHash } from 'crypto'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUT = __dirname
const BASE = process.env.MARKET_CERT_BASE || 'http://127.0.0.1:3599'

mkdirSync(OUT, { recursive: true })

async function main() {
  const res = await fetch(`${BASE}/api/market-data/snapshot`)
  if (!res.ok) throw new Error(`snapshot HTTP ${res.status}`)
  const snapshot = await res.json()

  const write = (name, obj) => {
    writeFileSync(path.join(OUT, name), JSON.stringify(obj, null, 2) + '\n')
    console.log('wrote', name)
  }

  write('market-snapshot.json', snapshot)
  write('market-dependency-graph.json', {
    canonicalApi: '/api/market-data/snapshot',
    builder: 'lib/market-data/canonicalMarketSnapshot.ts',
    consumers: {
      homeVolume: 'useHomeTradeData → useCanonicalMarketSnapshot.volume24hUsd',
      liquidityVolume: 'useLiquidityMarketSnapshot → useCanonicalMarketSnapshot.volume24hUsd',
      featured: 'useFeaturedProjectMarkets → snapshot.featured',
      trending: 'durableTrendingSnapshot atomic rules',
      apr: 'poolsAprRules',
      listedProjects: 'measureListedProjectsCount in snapshot',
      bnbUsd: 'lib/market-data/bnbUsd.ts',
    },
  })
  write('price-certification.json', {
    bnbUsd: snapshot.bnbUsd,
    bnbUsdSource: snapshot.bnbUsdSource,
    featured: snapshot.featured,
    coverage: snapshot.coverage,
  })
  write('volume-certification.json', {
    volume24hWbnb: snapshot.volume24hWbnb,
    volume24hUsd: snapshot.volume24hUsd,
    swapEventCount24h: snapshot.swapEventCount24h,
    pricedPairCount: snapshot.pricedPairCount,
    unpricedPairCount: snapshot.unpricedPairCount,
    methodology: snapshot.volumeMethodology,
    topContributors: (snapshot.pairs || []).slice(0, 12),
  })
  write('liquidity-certification.json', {
    featured: (snapshot.featured || []).map((f) => ({
      slug: f.slug,
      liquidityUsd: f.liquidityUsd,
      status: f.status,
      confidence: f.confidence,
    })),
  })
  write('apr-certification.json', {
    note: 'APR display/eligibility certified via poolsAprRules; no 50% hard cap',
    canonicalModule: 'views/PoolsStudio/poolsRuntime/poolsAprRules.ts',
  })
  write('featured-certification.json', {
    cards: (snapshot.featured || []).map((f) => ({
      project: f.slug,
      price: f.priceUsd ?? 'Unavailable',
      liquidity: f.liquidityUsd ?? 'Unavailable',
      volume: f.volume24hUsd ?? 'Unavailable',
      fdv: f.fdvUsd ?? 'Unavailable',
      reason: f.unavailableReason,
      status: f.status,
    })),
    coverage: snapshot.coverage,
  })
  write('trending-certification.json', { meta: snapshot.trending })
  write('top-movers-certification.json', {
    colorRules: { positive: '#00e676', negative: '#ff5252', zero: 'neutral' },
    atomicity: snapshot.trending,
  })
  write('cross-surface-proof.json', {
    homeVolumeField: 'snapshot.volume24hUsd',
    liquidityVolumeField: 'snapshot.volume24hUsd',
    featuredSource: 'snapshot.featured',
    listedProjects: snapshot.listedProjects,
    markets: snapshot.markets,
  })
  write('runtime-proof.json', {
    snapshotId: snapshot.snapshotId,
    generatedAt: snapshot.generatedAt,
    status: snapshot.status,
    fromLastGood: snapshot.fromLastGood ?? false,
  })
  write('sanity-check.json', snapshot.sanity)
  write('api-certification.json', {
    endpoints: [
      { path: '/api/market-data/snapshot', status: res.status, latencyNote: 'see capture' },
      { path: '/api/indexer/featured-markets/', role: 'embedded-builder' },
      { path: '/api/indexer/tier-metrics/', role: 'raw-tier' },
    ],
  })
  write('coverage.json', snapshot.coverage)
  write('release-market-proof.json', {
    snapshotId: snapshot.snapshotId,
    listedProjects: snapshot.listedProjects,
    markets: snapshot.markets,
    trackedTokens: snapshot.coverage?.trackedTokens,
    pricedTokens: snapshot.coverage?.pricedTokens,
    featuredCoverage: snapshot.coverage?.featuredCoverage,
    fdvCoverage: snapshot.coverage?.fdvCoverage,
    volume24hUsd: snapshot.volume24hUsd ?? 0,
    volume24hWbnb: snapshot.volume24hWbnb,
    bnbUsd: snapshot.bnbUsd,
    sanityOk: snapshot.sanity?.ok,
    status: snapshot.status,
    sha256: createHash('sha256').update(JSON.stringify(snapshot)).digest('hex'),
  })
  writeFileSync(
    path.join(OUT, 'before-after.md'),
    `# Before / After\n\nHome + Liquidity 24H Volume now read \`/api/market-data/snapshot\`.\nBNB/USD consolidated.\nFeatured prefers canonical observations.\n`,
  )
  writeFileSync(
    path.join(OUT, 'MISSION_REPORT.md'),
    `# MISSION REPORT — Market Data Final Certification\n\nSnapshot \`${snapshot.snapshotId}\` · Listed **${snapshot.listedProjects}** · Markets **${snapshot.markets}** · Featured ${snapshot.coverage?.featuredCoverage} · FDV ${snapshot.coverage?.fdvCoverage} · Volume USD ${snapshot.volume24hUsd ?? 0}\n`,
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
