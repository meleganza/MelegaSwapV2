import { DEX_GRAVITY_SCHEMA_VERSION, MELEGA_LIQUIDITY_SCHEMA } from './constants'
import { DEX_AUTHORITY_BOUNDARIES, buildProvenance } from './authorities'
import type { MelegaLiquidityV1Payload } from './schemas/types'

export function buildMelegaLiquidityV1(input?: {
  operation?: MelegaLiquidityV1Payload['operation']
  pair?: string
  poolAddress?: string
  wallet?: string
  chainId?: number
  routeAlias?: string
}): MelegaLiquidityV1Payload {
  return {
    schema: MELEGA_LIQUIDITY_SCHEMA,
    schemaVersion: DEX_GRAVITY_SCHEMA_VERSION,
    canonicalOwner: 'liquidityRuntime',
    canonicalRoute: '/liquidity-studio',
    aliasRoutes: input?.routeAlias ? ['/liquidity-studio', input.routeAlias] : ['/liquidity-studio', '/add', '/remove'],
    operation: input?.operation,
    poolDiscovery: true,
    lpPositions: true,
    analytics: true,
    optimizationRecommendations: true,
    autoExecution: false,
    rewardsOwnership: 'farms-pools-separate',
    authority: DEX_AUTHORITY_BOUNDARIES,
    provenance: buildProvenance(),
    pair: input?.pair,
    poolAddress: input?.poolAddress,
    wallet: input?.wallet,
    chainId: input?.chainId,
  }
}
