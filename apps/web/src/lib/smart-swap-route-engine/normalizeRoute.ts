import { createHash } from 'crypto'
import { buildExplanation, classifyRouteType, resolveRouteSource } from './classifyRoute'
import { highImpactWarning, scoreRouteConfidence } from './confidence'
import type { SmartSwapHop, SmartSwapPoolRef, SmartSwapRoute, SmartSwapTradeSnapshot } from './types'

function stableRouteId(snapshot: SmartSwapTradeSnapshot): string {
  if (snapshot.routeId) return snapshot.routeId
  const key = [
    snapshot.chainId,
    snapshot.input.address,
    snapshot.output.address,
    snapshot.pathAddresses.join('-'),
    snapshot.expectedOutputRaw,
    snapshot.source ?? 'smart-router',
  ].join('|')
  return `ssr_${createHash('sha256').update(key).digest('hex').slice(0, 16)}`
}

export function normalizeSmartSwapRoute(snapshot: SmartSwapTradeSnapshot): SmartSwapRoute {
  const routeType = classifyRouteType(snapshot)
  const source = resolveRouteSource(snapshot)
  const pools: SmartSwapPoolRef[] = (snapshot.pairs ?? []).map((p) => ({
    address: p.address,
    kind: p.kind ?? 'unknown',
    token0: p.token0,
    token1: p.token1,
  }))

  const hops: SmartSwapHop[] = []
  for (let i = 0; i < snapshot.pathAddresses.length - 1; i++) {
    const pool = pools[i] ?? {
      address: `unknown-pool-${i}`,
      kind: 'unknown' as const,
      token0: snapshot.pathAddresses[i],
      token1: snapshot.pathAddresses[i + 1],
    }
    hops.push({
      index: i,
      pool,
      tokenIn: snapshot.pathAddresses[i],
      tokenOut: snapshot.pathAddresses[i + 1],
    })
  }

  const impactPercent =
    snapshot.priceImpactPercent === undefined ? null : snapshot.priceImpactPercent === null ? null : snapshot.priceImpactPercent
  const impactAvailable = impactPercent != null && Number.isFinite(impactPercent)
  const gasAvailable = snapshot.gasUnits != null && Number.isFinite(snapshot.gasUnits)
  const feeAvailable = Boolean(snapshot.lpFeeRaw)

  const warnings = [...(snapshot.warnings ?? [])]
  const impactWarn = highImpactWarning(impactPercent, impactAvailable)
  if (impactWarn) warnings.push(impactWarn)
  if (!gasAvailable) {
    warnings.push('Gas estimate unavailable — quote still valid for comparison.')
  }
  if (!impactAvailable && routeType !== 'UNSUPPORTED') {
    warnings.push('Price impact unavailable from source.')
  }

  const confidence = scoreRouteConfidence({
    hasPath: snapshot.pathAddresses.length >= 2,
    hasOutput: Boolean(snapshot.expectedOutputRaw && snapshot.expectedOutputRaw !== '0'),
    impactAvailable,
    impactPercent,
    gasAvailable,
    feeAvailable,
    freshness: snapshot.freshness ?? null,
    unsupported: routeType === 'UNSUPPORTED',
  })

  const hopCount = hops.length
  return {
    routeId: stableRouteId(snapshot),
    routeType,
    inputToken: snapshot.input,
    outputToken: snapshot.output,
    hops,
    pools,
    expectedOutputRaw: snapshot.expectedOutputRaw,
    expectedOutputFormatted: snapshot.expectedOutputFormatted ?? null,
    priceImpact: {
      percent: impactAvailable ? impactPercent : null,
      availability: impactAvailable ? 'available' : 'unavailable',
      source: impactAvailable ? 'trade-price-impact' : 'unavailable',
    },
    gasEstimate: {
      units: gasAvailable ? (snapshot.gasUnits as number) : null,
      availability: gasAvailable ? 'available' : 'unavailable',
      source: gasAvailable ? 'estimator' : 'unavailable',
    },
    feeEstimate: {
      lpFeeRaw: feeAvailable ? (snapshot.lpFeeRaw as string) : null,
      lpFeeSymbol: snapshot.lpFeeSymbol ?? null,
      availability: feeAvailable ? 'available' : 'unavailable',
      source: feeAvailable ? 'realized-lp-fee' : 'unavailable',
      note: 'LP fee display only — protocol fee not proven in current execution path',
    },
    confidence,
    source,
    freshness: snapshot.freshness ?? null,
    warnings,
    explanation: buildExplanation(routeType, hopCount, source),
  }
}
