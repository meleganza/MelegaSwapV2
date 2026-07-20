/**
 * LB024 — stable Liquidity Studio view query mapping (`?view=`).
 * Kept free of mint/runtime imports so unit tests can load it safely.
 */

export type LiquidityStudioMode =
  | 'My Positions'
  | 'Add Liquidity'
  | 'Remove Liquidity'
  | 'Liquidity Building'
  | 'Simulation'

export const LIQUIDITY_STUDIO_VIEW_BY_MODE: Record<LiquidityStudioMode, string> = {
  'My Positions': 'positions',
  'Add Liquidity': 'add',
  'Remove Liquidity': 'remove',
  'Liquidity Building': 'building',
  Simulation: 'simulation',
}

export function liquidityStudioModeFromView(view: unknown): LiquidityStudioMode | null {
  const raw = Array.isArray(view) ? view[0] : view
  if (typeof raw !== 'string') return null
  const normalized = raw.trim().toLowerCase()
  switch (normalized) {
    case 'positions':
    case 'my-positions':
      return 'My Positions'
    case 'add':
    case 'add-liquidity':
    case 'explore':
      return 'Add Liquidity'
    case 'remove':
    case 'remove-liquidity':
      return 'Remove Liquidity'
    case 'building':
    case 'liquidity-building':
      return 'Liquidity Building'
    case 'simulation':
      return 'Simulation'
    default:
      return null
  }
}
