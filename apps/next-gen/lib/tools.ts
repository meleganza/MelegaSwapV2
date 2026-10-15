import { LIVE_DEX_LINKS } from './legacyServices'

export const COMMERCIAL_TOOLS = [
  {
    id: 'create-token',
    label: 'Create Token',
    summary: 'Opens List on the live DEX for BNB Smart Chain. This beta does not deploy a token.',
    href: LIVE_DEX_LINKS.createToken,
    detail: 'Create Token is the live List studio at intent create-token, chain 56. The live readiness endpoint reported the factory bound. This beta does not submit that transaction.',
  },
  {
    id: 'trend-boost',
    label: 'Trend Boost',
    summary: 'Opens Trend Boost on the live List studio. This beta does not take payment.',
    href: LIVE_DEX_LINKS.trendBoost,
    detail: 'Trend Boost checkout stays on the live List studio for a project you identify there. This beta does not create an order.',
  },
  {
    id: 'featured-project',
    label: 'Featured Project',
    summary: 'Opens Featured checkout on the live List studio. This beta does not take payment.',
    href: LIVE_DEX_LINKS.featured,
    detail: 'Featured checkout stays on the live List studio for a project you identify there. This beta does not sell a placement.',
  },
  {
    id: 'premium-project',
    label: 'Premium Project Page',
    summary: 'Opens project publishing on the live List studio. This beta does not publish a page.',
    href: LIVE_DEX_LINKS.premiumProject,
    detail: 'A project page is published from the live List studio, then served at /@handle. This beta does not publish one.',
  },
] as const

export type CommercialToolId = (typeof COMMERCIAL_TOOLS)[number]['id']

export function isCommercialTool(value: string): value is CommercialToolId {
  return COMMERCIAL_TOOLS.some((tool) => tool.id === value)
}

export function commercialTool(id: CommercialToolId): (typeof COMMERCIAL_TOOLS)[number] {
  const found = COMMERCIAL_TOOLS.find((tool) => tool.id === id)
  if (!found) throw new Error(`Unknown tool ${id}`)
  return found
}
