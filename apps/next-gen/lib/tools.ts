export const COMMERCIAL_TOOLS = [
  {
    id: 'create-token',
    label: 'Create Token',
    summary: 'Not operational. No chain is certified for token creation in this beta.',
  },
  {
    id: 'trend-boost',
    label: 'Trend Boost',
    summary: 'Not operational. No checkout and no placement.',
  },
  {
    id: 'featured-project',
    label: 'Featured Project',
    summary: 'Not operational. No featured placement is sold or shown.',
  },
  {
    id: 'premium-project',
    label: 'Premium Project Page',
    summary: 'Not operational. No project page is published from this beta.',
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
