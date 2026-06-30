import { stripUndefinedDeep } from 'registry/venues/manifest'
import { ECONOMIC_IDENTITY_VERSION } from './identity-constants'
import { resolveEconomicIdentityReadModel } from './identity-read-model'
import { EconomicIdentityManifest } from './identity-types'

export const serializeEconomicIdentityManifest = (
  addressParam?: string | null,
): EconomicIdentityManifest => {
  const model = resolveEconomicIdentityReadModel({ addressParam })

  const manifest: EconomicIdentityManifest = {
    manifest: 'manifest://melega/platform/economic-identity@0.1.0',
    api_version: ECONOMIC_IDENTITY_VERSION,
    phase: 'economic_identity_read_model',
    read_only: true,
    execution_enabled: false,
    as_of: model.asOf,
    disclaimer: model.disclaimer,
    framing: {
      is_social_profile: false,
      is_kyc: false,
      is_account_creation: false,
    },
    constitutional: model.constitutional,
    wallet: model.wallet,
    primary_archetype: model.primaryArchetype,
    archetypes: model.archetypes,
    agent_readiness: model.agentReadiness,
    sections: model.sections.map((section) => ({
      section_id: section.id,
      label: section.label,
      module_href: section.moduleHref,
      status: section.status,
      indexed_count: section.indexedCount,
      items: section.items,
    })),
    cross_links: model.crossLinks,
  }

  return stripUndefinedDeep(manifest) as EconomicIdentityManifest
}
