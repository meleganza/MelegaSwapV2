import { resolveProjectBySlug } from '../resolveProject'
import type { ProjectTokenomicsDocument } from './schema'
import { PROJECT_TOKENOMICS_SCHEMA_VERSION } from './schema'

/**
 * Tokenomics presentation model — only on-chain / registry facts today.
 * Full allocation breakdown is not fabricated when unpublished.
 */
export function buildProjectTokenomicsDocument(
  slug: string,
  generatedAt = new Date().toISOString(),
): ProjectTokenomicsDocument | null {
  const resolved = resolveProjectBySlug(slug)
  if (!resolved.ok) return null
  const project = resolved.project
  const primary = project.resources.tokens.find((t) => t.chainId === 56) ?? project.resources.tokens[0]

  const facts = [
    {
      id: 'symbol',
      label: 'Symbol',
      value: primary?.symbol ?? (project.slug === 'marco' ? 'MARCO' : null),
      provenance: primary ? ('ON_CHAIN' as const) : ('UNAVAILABLE' as const),
      note: null as string | null,
    },
    {
      id: 'decimals',
      label: 'Decimals',
      value: primary ? '18' : null,
      provenance: primary ? ('ON_CHAIN' as const) : ('UNAVAILABLE' as const),
      note: primary ? 'BEP-20 / ERC-20 decimals observed for registered contracts' : null,
    },
    {
      id: 'primary-contract',
      label: 'Primary contract',
      value: primary?.address ?? null,
      provenance: primary ? ('ON_CHAIN' as const) : ('UNAVAILABLE' as const),
      note: null as string | null,
    },
    {
      id: 'chains',
      label: 'Supported chains',
      value: project.supportedChains.length
        ? project.supportedChains.map(String).join(', ')
        : null,
      provenance: project.supportedChains.length ? ('PROJECT_ATTESTED' as const) : ('UNAVAILABLE' as const),
      note: 'Chain list from project registry — human labels applied in UX',
    },
    {
      id: 'total-supply',
      label: 'Total supply',
      value: null,
      provenance: 'UNAVAILABLE' as const,
      note: 'Full tokenomics supply not published in the certified registry',
    },
    {
      id: 'circulating-supply',
      label: 'Circulating supply',
      value: null,
      provenance: 'UNAVAILABLE' as const,
      note: null as string | null,
    },
  ]

  return {
    schemaVersion: PROJECT_TOKENOMICS_SCHEMA_VERSION,
    projectId: project.upi,
    slug: project.slug,
    published: false,
    facts,
    allocationCategories: [],
    unpublishedReason: 'Full tokenomics not published in the certified project registry.',
    generatedAt,
  }
}
