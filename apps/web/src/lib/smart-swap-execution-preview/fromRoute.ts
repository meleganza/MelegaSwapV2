import type { SmartSwapRoute } from 'lib/smart-swap-route-engine'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import type { SmartSwapExecutionPreviewInput } from './types'

/** Adapt a Module 002 route + swap amounts/slippage into preview input. */
export function executionPreviewInputFromRoute(input: {
  route: SmartSwapRoute
  inputAmount: string
  slippageBips: number
  pathSymbols?: string[]
  nowIso?: string
  stale?: boolean
}): SmartSwapExecutionPreviewInput {
  const { route } = input
  const outAddr = route.outputToken.address.toLowerCase()
  const isBuyMarco = outAddr === MARCO_BSC_ADDRESS.toLowerCase()
  return {
    routeId: route.routeId,
    inputAmount: input.inputAmount,
    inputToken: route.inputToken,
    outputToken: route.outputToken,
    expectedOutputRaw: route.expectedOutputRaw,
    expectedOutputFormatted: route.expectedOutputFormatted,
    slippageBips: input.slippageBips,
    priceImpactPercent: route.priceImpact.percent,
    gasUnits: route.gasEstimate.units,
    hops: route.hops,
    pools: route.pools,
    pathSymbols: input.pathSymbols,
    pathAddresses: route.pathAddresses,
    freshness: route.freshness,
    isBuyMarco,
    unsupportedToken: route.routeType === 'UNSUPPORTED',
    insufficientLiquidity: route.expectedOutputRaw === '0',
    partialData: route.priceImpact.availability === 'unavailable' && route.hops.length === 0,
    stale: input.stale,
    nowIso: input.nowIso,
  }
}
