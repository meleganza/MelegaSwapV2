/** R780 — DEX Intelligence public disposition until real analytics pipelines are operational. */
export const DEX_INTELLIGENCE_DISPOSITION = {
  publicReady: false,
  label: 'Coming Soon',
  reason:
    'DEX Intelligence requires indexed volume, liquidity deltas, and wallet analytics. Synthetic registry events are not shown as live intelligence.',
  route: '/radar',
} as const

export function isDexIntelligencePublicReady(): boolean {
  return DEX_INTELLIGENCE_DISPOSITION.publicReady
}
