export const LIQUIDITY_RUNTIME_CANONICAL_OWNER = 'liquidityRuntime' as const
export const LIQUIDITY_STUDIO_CANONICAL_ROUTE = '/liquidity-studio' as const

export const LIQUIDITY_ALIAS_ROUTES = {
  add: '/add',
  remove: '/remove',
  legacy: '/liquidity',
} as const

export interface LiquidityCanonicalOwnership {
  owner: typeof LIQUIDITY_RUNTIME_CANONICAL_OWNER
  canonicalRoute: typeof LIQUIDITY_STUDIO_CANONICAL_ROUTE
  aliasRoute?: string
  mintBurnPrimitives: readonly ['state/mint', 'state/burn']
  rewardsOwnership: 'farms-pools-separate'
}

export function buildLiquidityCanonicalOwnership(aliasRoute?: string): LiquidityCanonicalOwnership {
  return {
    owner: LIQUIDITY_RUNTIME_CANONICAL_OWNER,
    canonicalRoute: LIQUIDITY_STUDIO_CANONICAL_ROUTE,
    aliasRoute,
    mintBurnPrimitives: ['state/mint', 'state/burn'],
    rewardsOwnership: 'farms-pools-separate',
  }
}
