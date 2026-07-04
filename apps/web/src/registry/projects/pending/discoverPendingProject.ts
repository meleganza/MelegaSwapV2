import { computePendingReadinessScore } from './computeReadinessScore'
import { createProvenanceField, unavailableField } from './provenance'
import type { PendingProjectRecord } from './types'

export interface OnChainTokenHints {
  name?: string | null
  symbol?: string | null
}

export interface AiDiscoveryHints {
  category?: string | null
  description?: string | null
  website?: string | null
  socials?: {
    twitter?: string | null
    telegram?: string | null
    discord?: string | null
    github?: string | null
  }
  sources?: string[]
  confidence?: number
}

function pendingId(chainId: number, contract: string): string {
  return `pending:${chainId}:${contract.toLowerCase()}`
}

function socialField(url: string | null | undefined, source: 'onchain' | 'ai_discovery') {
  return url
    ? createProvenanceField({ value: url, source, confidence: source === 'ai_discovery' ? 0.6 : 0.9 })
    : unavailableField('ai_discovery')
}

/**
 * Creates a pending project profile from contract discovery.
 * Never fabricates website, social, or logo URLs.
 */
export function buildPendingProjectRecord(input: {
  contract: string
  chainId: number
  onChain?: OnChainTokenHints
  ai?: AiDiscoveryHints
  existing?: PendingProjectRecord
}): PendingProjectRecord {
  const now = new Date().toISOString()
  const contract = input.contract.trim().toLowerCase()
  const id = pendingId(input.chainId, contract)

  const name = input.onChain?.name
    ? createProvenanceField({ value: input.onChain.name, source: 'onchain', confidence: 0.95 })
    : unavailableField('ai_discovery')

  const symbol = input.onChain?.symbol
    ? createProvenanceField({ value: input.onChain.symbol, source: 'onchain', confidence: 0.95 })
    : unavailableField('ai_discovery')

  const logo = unavailableField('ai_discovery')

  const website = input.ai?.website
    ? createProvenanceField({
        value: input.ai.website,
        source: 'ai_discovery',
        confidence: input.ai.confidence ?? 0.5,
        notes: 'AI-suggested — requires owner confirmation before canonical listing.',
      })
    : unavailableField('ai_discovery')

  const socials = {
    twitter: socialField(input.ai?.socials?.twitter, 'ai_discovery'),
    telegram: socialField(input.ai?.socials?.telegram, 'ai_discovery'),
    discord: socialField(input.ai?.socials?.discord, 'ai_discovery'),
    github: socialField(input.ai?.socials?.github, 'ai_discovery'),
  }

  const category = input.ai?.category
    ? createProvenanceField({
        value: input.ai.category,
        source: 'ai_discovery',
        confidence: input.ai.confidence ?? 0.4,
      })
    : unavailableField('ai_discovery')

  const description_ai = input.ai?.description
    ? createProvenanceField({
        value: input.ai.description,
        source: 'ai_discovery',
        confidence: input.ai.confidence ?? 0.5,
        notes: 'Heuristic AI summary — not canonical narrative.',
      })
    : createProvenanceField({
        value: null,
        source: 'ai_discovery',
        notes: 'AI discovery complete — no narrative synthesized without evidence.',
      })

  const description_owner = input.existing?.description_owner ?? unavailableField('owner_submission')

  const sources = input.ai?.sources?.length
    ? createProvenanceField<string[]>({
        value: input.ai.sources,
        source: 'ai_discovery',
        confidence: input.ai.confidence ?? 0.5,
      })
    : createProvenanceField<string[]>({ value: null, source: 'ai_discovery' })

  const rating = unavailableField('ai_discovery')

  const draft: PendingProjectRecord = {
    schema: 'melega.project-profile.pending.v1',
    id,
    contract,
    chain: input.chainId,
    name,
    symbol,
    logo,
    website,
    socials,
    category,
    description_ai,
    description_owner,
    sources,
    health: {
      readiness_score: 0,
      identity_completeness: 0,
      review_ready: false,
      missing_fields: [],
    },
    rating,
    status: input.existing?.status ?? 'discovered',
    is_canonical: false,
    created_at: input.existing?.created_at ?? now,
    updated_at: now,
    review: input.existing?.review ?? { state: 'discovered' },
  }

  draft.health = computePendingReadinessScore(draft)
  return draft
}

export function buildPendingDiscoverySummary(record: PendingProjectRecord): string {
  const label = record.name.available ? record.name.value : record.symbol.available ? record.symbol.value : 'Unknown token'
  return `${label} discovered on chain ${record.chain}. Pending registry review — not canonical until approved.`
}

export { pendingId }
