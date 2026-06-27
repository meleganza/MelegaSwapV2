export const PROJECT_REGISTRY_AS_OF = '2026-06-26'

export const PROJECT_REGISTRY_DISCLAIMER =
  'Listed ≠ audited. Static registry MVP — automated verification not live. Observed = legacy-indexed data only.'

export const CHAIN_LABELS: Record<number, string> = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  8453: 'Base',
}

export const CHAIN_EXPLORER_TOKEN_URL: Record<number, (address: string) => string> = {
  1: (address) => `https://etherscan.io/token/${address}`,
  56: (address) => `https://bscscan.com/token/${address}`,
  137: (address) => `https://polygonscan.com/token/${address}`,
  8453: (address) => `https://basescan.org/token/${address}`,
}

export const CAPABILITY_LABELS: Record<keyof import('./types').ProjectCapabilities, string> = {
  tradable: 'Tradable',
  liquidity: 'Liquidity',
  farm: 'Farm',
  pool: 'Pool (staking)',
  lock: 'Lock',
  vesting: 'Vesting',
  launch: 'Launch',
  smartdrop: 'SmartDrop',
  radar: 'Radar',
  space: 'Space',
  labs: 'Labs',
  aiReport: 'AI Report',
  machineManifest: 'Machine Manifest',
  treasuryCompatible: 'Treasury Compatible',
}
