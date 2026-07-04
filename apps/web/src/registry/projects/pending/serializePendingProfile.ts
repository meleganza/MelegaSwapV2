import type { PendingProjectRecord } from './types'

export function serializePendingProjectProfile(record: PendingProjectRecord) {
  return {
    schema: record.schema,
    id: record.id,
    contract: record.contract,
    chain: record.chain,
    status: record.status,
    is_canonical: false,
    registry_tier: 'pending' as const,
    name: record.name,
    symbol: record.symbol,
    logo: record.logo,
    website: record.website,
    socials: record.socials,
    category: record.category,
    description_ai: record.description_ai,
    description_owner: record.description_owner,
    sources: record.sources,
    health: record.health,
    rating: record.rating,
    review: record.review,
    created_at: record.created_at,
    updated_at: record.updated_at,
    promotion: {
      eligible: record.status === 'approved',
      requires_manual_registry_write: true,
      canonical_rule:
        'Approved pending profiles require human operator merge into STATIC_PROJECTS — no auto-canonicalization.',
    },
  }
}

export function serializePendingRegistryIndex(records: PendingProjectRecord[]) {
  return {
    schema: 'melega.project-registry.pending-index.v1',
    as_of: new Date().toISOString(),
    count: records.length,
    projects: records.map((record) => ({
      id: record.id,
      contract: record.contract,
      chain: record.chain,
      status: record.status,
      readiness_score: record.health.readiness_score,
      name: record.name.available ? record.name.value : 'Unavailable',
      symbol: record.symbol.available ? record.symbol.value : 'Unavailable',
      is_canonical: false,
      profile_url: `/api/registry/projects/pending/${encodeURIComponent(record.id)}`,
    })),
  }
}
