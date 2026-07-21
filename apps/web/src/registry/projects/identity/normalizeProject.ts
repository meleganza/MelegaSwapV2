import { CAPABILITY_LABELS, CHAIN_EXPLORER_TOKEN_URL, CHAIN_LABELS } from '../constants'
import { computeCivilizationReadiness } from '../discovery'
import type { CapabilityStatus, StaticProjectRecord, TokenRef } from '../types'
import { toCaip10Contract, toCaip19Erc20, toCaip2ChainId, normalizeEvmAddress } from './caip'
import {
  PROJECT_PAGE_SCHEMA_VERSION,
  projectFieldAvailable,
  projectFieldUnavailable,
  type DeclaredCapabilityState,
  type ProjectFieldSourceClass,
} from './provenance'
import type {
  CanonicalDeclaredCapability,
  CanonicalProjectAsset,
  CanonicalProjectContract,
  CanonicalProjectDeployment,
  CanonicalProjectDocument,
  CanonicalProjectEvidence,
  CanonicalProjectResource,
  ProjectAssetRole,
  ProjectResourceType,
} from './types'
import { isSafeHttpUrl, sanitizePlainText } from './urlSafety'

export function projectIdFromUpi(upi: string): string {
  return upi
}

export function canonicalProjectPath(slug: string): string {
  return `/@${slug}/`
}

export function canonicalProjectAbsoluteUrl(slug: string, origin = 'https://www.melega.finance'): string {
  return `${origin.replace(/\/$/, '')}${canonicalProjectPath(slug)}`
}

function mapCapabilityState(status: CapabilityStatus): DeclaredCapabilityState {
  switch (status) {
    case 'live':
    case 'partial':
      return 'AVAILABLE'
    case 'planned':
    case 'scheduled':
      return 'UNAVAILABLE'
    case 'none':
      return 'NOT_APPLICABLE'
    case 'finished':
      return 'PAUSED'
    case 'unverified':
    case 'clear':
    case 'watch':
    default:
      return 'UNKNOWN'
  }
}

function verificationLabel(project: StaticProjectRecord): string {
  if (project.trustBadges.includes('canonical') && project.verificationStatus === 'observed') {
    return 'Registry identity observed (canonical listing)'
  }
  if (project.verificationStatus === 'observed') {
    return 'Project identity observed in registry'
  }
  return 'Project identity claimed (unverified)'
}

function resourceFromUrl(
  resourceType: ProjectResourceType,
  label: string,
  url: string | undefined,
  source: ProjectFieldSourceClass,
  asOf: string,
): CanonicalProjectResource | null {
  if (!url || !isSafeHttpUrl(url)) return null
  return {
    resourceType,
    label,
    url: url.trim(),
    provenance: {
      source,
      availability: 'AVAILABLE',
      observedAt: asOf,
      updatedAt: asOf,
      notes: null,
    },
  }
}

function socialLabel(type: string): string {
  const t = type.toLowerCase()
  if (t === 'twitter' || t === 'x') return 'X (Twitter)'
  if (t === 'telegram') return 'Telegram'
  if (t === 'instagram') return 'Instagram'
  if (t === 'discord') return 'Discord'
  if (t === 'github') return 'GitHub'
  return type
}

function assetRole(token: TokenRef, primaryRefs: string[]): ProjectAssetRole {
  if (primaryRefs.includes(token.ref)) return 'primary'
  return 'secondary'
}

function buildAssets(project: StaticProjectRecord): {
  assets: CanonicalProjectAsset[]
  contracts: CanonicalProjectContract[]
  conflicts: string[]
} {
  const assets: CanonicalProjectAsset[] = []
  const contracts: CanonicalProjectContract[] = []
  const conflicts: string[] = []
  const seenCaip10 = new Map<string, string>()

  for (const token of project.resources.tokens) {
    const address = normalizeEvmAddress(token.address)
    if (!address) continue
    let caip2: string
    try {
      caip2 = toCaip2ChainId(token.chainId)
    } catch {
      continue
    }
    const caip10 = toCaip10Contract(token.chainId, address)
    const caip19 = toCaip19Erc20(token.chainId, address)
    if (!caip10 || !caip19) continue

    const priorSymbol = seenCaip10.get(caip10)
    if (priorSymbol && priorSymbol !== token.symbol) {
      conflicts.push(`Conflicting symbols for ${caip10}: ${priorSymbol} vs ${token.symbol}`)
    }
    seenCaip10.set(caip10, token.symbol)

    const role = assetRole(token, project.primaryTokenRefs)
    assets.push({
      assetId: caip19,
      assetType: 'fungible_token',
      name: projectFieldUnavailable('UNKNOWN', 'Token display name not in registry'),
      symbol: projectFieldAvailable(token.symbol, 'PROJECT_ATTESTED', {
        observedAt: project.asOf,
        updatedAt: project.asOf,
      }),
      decimals: projectFieldUnavailable('UNKNOWN', 'Decimals not present in static registry'),
      chainId: token.chainId,
      caip2,
      caip19,
      contractAddress: address,
      projectRole: role,
      relationship: role === 'primary' ? 'canonical' : 'secondary',
    })

    const explorerBuilder = CHAIN_EXPLORER_TOKEN_URL[token.chainId]
    const explorerUrl = explorerBuilder ? explorerBuilder(address) : null
    contracts.push({
      contractId: caip10,
      chainId: token.chainId,
      caip2,
      caip10,
      address,
      classification: 'token_contract',
      explorerUrl: explorerUrl
        ? projectFieldAvailable(explorerUrl, 'DERIVED', {
            observedAt: project.asOf,
            updatedAt: project.asOf,
            notes: 'Derived from known chain explorer map',
          })
        : projectFieldUnavailable('UNKNOWN', 'No explorer mapping for chain'),
      verificationStatus: projectFieldUnavailable('UNKNOWN', 'Contract source verification not asserted by PP001'),
    })
  }

  return { assets, contracts, conflicts }
}

function buildDeployments(
  project: StaticProjectRecord,
  contracts: CanonicalProjectContract[],
  capabilityKeys: string[],
): CanonicalProjectDeployment[] {
  return project.supportedChains.map((chainId) => {
    const caip2 = toCaip2ChainId(chainId)
    const associated = contracts.filter((c) => c.chainId === chainId).map((c) => c.contractId)
    return {
      deploymentId: `${projectIdFromUpi(project.upi)}#${caip2}`,
      chainId,
      caip2,
      status: projectFieldAvailable('listed', 'PROJECT_ATTESTED', {
        observedAt: project.asOf,
        updatedAt: project.asOf,
        notes: 'Chain listed in registry supportedChains',
      }),
      associatedContractIds: associated,
      availableCapabilityKeys: capabilityKeys,
      observedAt: project.asOf,
      updatedAt: project.asOf,
    }
  })
}

function buildResources(project: StaticProjectRecord): CanonicalProjectResource[] {
  const out: CanonicalProjectResource[] = []
  const website = resourceFromUrl('website', 'Official website', project.websiteUrl, 'PROJECT_ATTESTED', project.asOf)
  if (website) out.push(website)
  const docs = resourceFromUrl('documentation', 'Documentation', project.docsUrl, 'PROJECT_ATTESTED', project.asOf)
  if (docs) out.push(docs)
  const space = resourceFromUrl('space', 'Melega Space', project.spaceProfileUrl, 'PROJECT_ATTESTED', project.asOf)
  if (space) out.push(space)

  for (const social of project.socialLinks ?? []) {
    const item = resourceFromUrl(
      social.type.toLowerCase() === 'github' ? 'github' : 'social',
      socialLabel(social.type),
      social.url,
      'PROJECT_ATTESTED',
      project.asOf,
    )
    if (item) out.push(item)
  }
  return out
}

function buildCapabilities(project: StaticProjectRecord): CanonicalDeclaredCapability[] {
  return (Object.keys(project.capabilities) as Array<keyof typeof project.capabilities>).map((key) => {
    const cell = project.capabilities[key]
    return {
      key,
      label: CAPABILITY_LABELS[key],
      state: mapCapabilityState(cell.status),
      notes: cell.notes ? sanitizePlainText(cell.notes, 500) : null,
    }
  })
}

function buildEvidence(project: StaticProjectRecord, conflicts: string[]): CanonicalProjectEvidence[] {
  const evidence: CanonicalProjectEvidence[] = [
    {
      evidenceType: 'registry_listing',
      sourceType: 'MELEGA_VERIFIED',
      reference: project.upi,
      status: project.isCanonical ? 'canonical_listing' : 'listed',
      observedAt: project.asOf,
      updatedAt: project.asOf,
      freshness: 'current',
    },
    {
      evidenceType: 'verification_state',
      sourceType: project.verificationStatus === 'observed' ? 'MELEGA_VERIFIED' : 'PROJECT_ATTESTED',
      reference: verificationLabel(project),
      status: project.verificationStatus,
      observedAt: project.asOf,
      updatedAt: project.asOf,
      freshness: 'current',
    },
  ]

  if (project.capabilities.machineManifest.status === 'live') {
    evidence.push({
      evidenceType: 'machine_manifest',
      sourceType: 'MELEGA_VERIFIED',
      reference: `/registry/projects/${project.slug}.json`,
      status: 'available',
      observedAt: project.asOf,
      updatedAt: project.asOf,
      freshness: 'current',
    })
  }

  for (const conflict of conflicts) {
    evidence.push({
      evidenceType: 'contract_conflict',
      sourceType: 'DERIVED',
      reference: conflict,
      status: 'conflicted',
      observedAt: project.asOf,
      updatedAt: project.asOf,
      freshness: 'unknown',
    })
  }

  evidence.push({
    evidenceType: 'audit_information',
    sourceType: 'UNKNOWN',
    reference: 'Audit information unavailable',
    status: 'unavailable',
    observedAt: null,
    updatedAt: null,
    freshness: 'unknown',
  })

  return evidence
}

function buildNavSections(doc: {
  descriptionAvailable: boolean
  hasTrust: boolean
  hasChains: boolean
  hasResources: boolean
  hasAssets: boolean
}): Array<{ id: string; label: string }> {
  const sections: Array<{ id: string; label: string }> = [{ id: 'overview', label: 'Overview' }]
  if (doc.hasTrust) sections.push({ id: 'trust', label: 'Trust' })
  if (doc.hasChains || doc.hasResources || doc.hasAssets) {
    sections.push({ id: 'ecosystem', label: 'Ecosystem' })
  }
  return sections
}

/** Deterministic non-cryptographic revision fingerprint (Node/browser safe). */
function computeRevision(project: StaticProjectRecord, slug: string): string {
  const payload = JSON.stringify({
    upi: project.upi,
    slug,
    asOf: project.asOf,
    tokens: project.resources.tokens,
    chains: project.supportedChains,
    verification: project.verificationStatus,
  })
  let hash = 2166136261
  for (let i = 0; i < payload.length; i += 1) {
    hash ^= payload.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

/**
 * Normalize a StaticProjectRecord into the PP001 canonical project document.
 * Same object backs HTML shell and public JSON.
 */
export function normalizeProjectDocument(
  project: StaticProjectRecord,
  options?: { generatedAt?: string; origin?: string },
): CanonicalProjectDocument {
  const generatedAt = options?.generatedAt ?? new Date().toISOString()
  const aliases = (project.aliases ?? []).map((a) => a.trim().toLowerCase()).filter(Boolean)
  const shortPurposeRaw = sanitizePlainText(project.tagline ?? null, 280)
  const descriptionRaw = sanitizePlainText(project.description ?? null, 4000)
  const { assets, contracts, conflicts } = buildAssets(project)
  const capabilities = buildCapabilities(project)
  const availableCapabilityKeys = capabilities.filter((c) => c.state === 'AVAILABLE').map((c) => c.key)
  const deployments = buildDeployments(project, contracts, availableCapabilityKeys)
  const resources = buildResources(project)
  const evidence = buildEvidence(project, conflicts)

  let readinessField = projectFieldUnavailable<{
    label: string
    score: number | null
    disclaimer: string
  }>('UNKNOWN', 'Civilization Readiness not computed')
  try {
    const score = computeCivilizationReadiness(project)
    readinessField = projectFieldAvailable(
      {
        label: 'Civilization Readiness',
        score,
        disclaimer:
          'Readiness measures Melega ecosystem integration completeness. It is not a safety, audit, or investment rating.',
      },
      'DERIVED',
      {
        observedAt: project.asOf,
        updatedAt: project.asOf,
        notes: 'Derived from existing discovery.computeCivilizationReadiness',
      },
    )
  } catch {
    // keep unavailable
  }

  const logoUrl = project.logoUrl && isSafeHttpUrl(project.logoUrl) ? project.logoUrl.trim() : null

  const identity = {
    projectId: projectIdFromUpi(project.upi),
    slug: project.slug,
    aliases,
    displayName: sanitizePlainText(project.displayName, 120) ?? project.slug,
    shortPurpose: shortPurposeRaw
      ? projectFieldAvailable(shortPurposeRaw, 'PROJECT_ATTESTED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
        })
      : projectFieldUnavailable<string>('UNKNOWN', 'No purpose statement in registry'),
    description: descriptionRaw
      ? projectFieldAvailable(descriptionRaw, 'PROJECT_ATTESTED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
        })
      : projectFieldUnavailable<string>('UNKNOWN', 'No description in registry'),
    projectType: project.projectType
      ? projectFieldAvailable(project.projectType, 'PROJECT_ATTESTED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
        })
      : project.sectorTags[0]
      ? projectFieldAvailable(project.sectorTags[0], 'DERIVED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
          notes: 'Derived from first sector tag when projectType absent',
        })
      : projectFieldUnavailable<string>('UNKNOWN', 'Project type not set'),
    lifecycleStatus: project.lifecycleStatus
      ? projectFieldAvailable(project.lifecycleStatus, 'PROJECT_ATTESTED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
        })
      : projectFieldAvailable(project.registryStatus, 'MELEGA_VERIFIED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
          notes: 'Mapped from registryStatus',
        }),
    categories: [...project.sectorTags],
    tags: [...project.sectorTags],
    logoUrl: logoUrl
      ? projectFieldAvailable(logoUrl, 'PROJECT_ATTESTED', {
          observedAt: project.asOf,
          updatedAt: project.asOf,
        })
      : projectFieldUnavailable<string>('UNKNOWN', 'No logo URL in registry'),
    verificationState: projectFieldAvailable(verificationLabel(project), 'MELEGA_VERIFIED', {
      observedAt: project.asOf,
      updatedAt: project.asOf,
    }),
    readiness: readinessField,
    updatedAt: project.asOf,
  }

  const chains = project.supportedChains.map((chainId) => ({
    chainId,
    caip2: toCaip2ChainId(chainId),
    label: CHAIN_LABELS[chainId] ?? `Chain ${chainId}`,
    availability: 'AVAILABLE' as const,
  }))

  const navSections = buildNavSections({
    descriptionAvailable: identity.description.meta.availability === 'AVAILABLE',
    hasTrust: evidence.length > 0,
    hasChains: chains.length > 0 || deployments.length > 0,
    hasResources: resources.length > 0,
    hasAssets: assets.length > 0 || contracts.length > 0,
  })

  const sourcesPresent = new Set<ProjectFieldSourceClass>()
  sourcesPresent.add('MELEGA_VERIFIED')
  if (shortPurposeRaw || descriptionRaw) sourcesPresent.add('PROJECT_ATTESTED')
  if (assets.length) sourcesPresent.add('PROJECT_ATTESTED')
  if (readinessField.meta.availability === 'AVAILABLE') sourcesPresent.add('DERIVED')

  const availabilityNotes: string[] = []
  if (identity.logoUrl.meta.availability === 'UNAVAILABLE') {
    availabilityNotes.push('Logo unavailable — neutral fallback used in UI')
  }
  if (conflicts.length) {
    availabilityNotes.push('Conflicting contract information detected — not silently reconciled')
  }
  if (evidence.some((e) => e.evidenceType === 'audit_information')) {
    availabilityNotes.push('Audit information unavailable')
  }

  return {
    schemaVersion: PROJECT_PAGE_SCHEMA_VERSION,
    projectId: identity.projectId,
    slug: project.slug,
    aliases,
    canonicalUrl: canonicalProjectAbsoluteUrl(project.slug, options?.origin),
    revision: computeRevision(project, project.slug),
    generatedAt,
    updatedAt: project.asOf,
    identity,
    chains,
    assets,
    deployments,
    contracts,
    resources,
    evidence,
    declaredCapabilities: capabilities,
    navSections,
    provenanceSummary: {
      sourcesPresent: Array.from(sourcesPresent).sort(),
      availabilityNotes,
    },
  }
}

/** Deterministic public JSON (sorted keys via stable stringify at API boundary). */
export function toPublicProjectJson(
  doc: CanonicalProjectDocument,
  options?: {
    evidenceSummary?: Record<string, unknown>
    readinessSummary?: Record<string, unknown>
    trustSnapshotSummary?: Record<string, unknown>
    /** Static support metadata only — never wallet balances or positions. */
    walletRelationshipSupport?: Record<string, unknown>
    /** Public-safe markets summary only — never wallet-specific market state. */
    marketsSummary?: Record<string, unknown>
    /** Public-safe participation summary only — never wallet positions. */
    participationSummary?: Record<string, unknown>
    /** Public-safe Liquidity Building summary only — never execution or wallet data. */
    liquidityBuildingSummary?: Record<string, unknown>
    /** Public-safe updates summary only — never private or draft updates. */
    updatesSummary?: Record<string, unknown>
    /** Public-safe ecosystem summary only — never private services. */
    ecosystemSummary?: Record<string, unknown>
    /** Public-safe developer summary only — never private integration secrets. */
    developerSummary?: Record<string, unknown>
    /** Public-safe governance summary only — never treasury balances or voting state. */
    governanceSummary?: Record<string, unknown>
    /** Public-safe control-center claim/verification only — never private drafts or secrets. */
    controlCenterSummary?: Record<string, unknown>
  },
): Record<string, unknown> {
  const body: Record<string, unknown> = {
    schemaVersion: doc.schemaVersion,
    projectId: doc.projectId,
    slug: doc.slug,
    aliases: doc.aliases,
    canonicalUrl: doc.canonicalUrl,
    revision: doc.revision,
    generatedAt: doc.generatedAt,
    updatedAt: doc.updatedAt,
    identity: {
      projectId: doc.identity.projectId,
      slug: doc.identity.slug,
      aliases: doc.identity.aliases,
      displayName: doc.identity.displayName,
      shortPurpose: doc.identity.shortPurpose,
      description: doc.identity.description,
      projectType: doc.identity.projectType,
      lifecycleStatus: doc.identity.lifecycleStatus,
      categories: doc.identity.categories,
      tags: doc.identity.tags,
      logoUrl: doc.identity.logoUrl,
      verificationState: doc.identity.verificationState,
      readiness: doc.identity.readiness,
      updatedAt: doc.identity.updatedAt,
    },
    projectType: doc.identity.projectType,
    lifecycleStatus: doc.identity.lifecycleStatus,
    categories: doc.identity.categories,
    tags: doc.identity.tags,
    verification: doc.identity.verificationState,
    readiness: doc.identity.readiness,
    chains: doc.chains,
    assets: doc.assets,
    deployments: doc.deployments,
    contracts: doc.contracts,
    resources: doc.resources,
    evidence: doc.evidence,
    declaredCapabilities: doc.declaredCapabilities,
    provenance: doc.provenanceSummary,
    availabilityStates: {
      logo: doc.identity.logoUrl.meta.availability,
      shortPurpose: doc.identity.shortPurpose.meta.availability,
      description: doc.identity.description.meta.availability,
      readiness: doc.identity.readiness.meta.availability,
      assets: doc.assets.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
      deployments: doc.deployments.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
      resources: doc.resources.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
      trustEvidence: options?.evidenceSummary
        ? (options.evidenceSummary.availability as string)
        : doc.evidence.length > 0
        ? 'AVAILABLE'
        : 'UNAVAILABLE',
    },
  }

  // PP002 additive extension — schemaVersion remains melega.project-page.v1
  if (options?.evidenceSummary) {
    body.evidenceSummary = options.evidenceSummary
  }

  // PP003 additive extensions — schemaVersion remains melega.project-page.v1
  if (options?.readinessSummary) {
    body.readinessSummary = options.readinessSummary
  }
  if (options?.trustSnapshotSummary) {
    body.trustSnapshotSummary = options.trustSnapshotSummary
  }

  // PP004 — static support metadata only (no wallet-specific fields)
  if (options?.walletRelationshipSupport) {
    body.walletRelationshipSupport = options.walletRelationshipSupport
  }

  // PP005 — public-safe markets summary (no quotes, balances, or wallet context)
  if (options?.marketsSummary) {
    body.marketsSummary = options.marketsSummary
  }

  // PP006 — public-safe participation summary (no wallet positions or rewards)
  if (options?.participationSummary) {
    body.participationSummary = options.participationSummary
  }

  // PP007 — public-safe Liquidity Building summary (discovery only)
  if (options?.liquidityBuildingSummary) {
    body.liquidityBuildingSummary = options.liquidityBuildingSummary
  }

  // PP008 — public-safe updates summary (no private drafts or social metrics)
  if (options?.updatesSummary) {
    body.updatesSummary = options.updatesSummary
  }

  // PP009 — public-safe ecosystem summary (service graph discovery only)
  if (options?.ecosystemSummary) {
    body.ecosystemSummary = options.ecosystemSummary
  }

  // PP010 — public-safe developer summary (integration discovery only)
  if (options?.developerSummary) {
    body.developerSummary = options.developerSummary
  }

  // PP011 — public-safe governance summary (disclosure only; no treasury payload)
  if (options?.governanceSummary) {
    body.governanceSummary = options.governanceSummary
  }

  // PP012 — public-safe claim/verification only (no private drafts, roles detail, or secrets)
  if (options?.controlCenterSummary) {
    body.controlCenterSummary = options.controlCenterSummary
  }

  return body
}

export function buildProjectJsonLd(doc: CanonicalProjectDocument): Record<string, unknown> {
  const sameAs = doc.resources.map((r) => r.url)
  const entity: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': doc.canonicalUrl,
    name: doc.identity.displayName,
    url: doc.canonicalUrl,
    identifier: doc.projectId,
  }
  if (doc.identity.description.meta.availability === 'AVAILABLE' && doc.identity.description.value) {
    entity.description = doc.identity.description.value
  }
  if (doc.identity.logoUrl.meta.availability === 'AVAILABLE' && doc.identity.logoUrl.value) {
    entity.logo = doc.identity.logoUrl.value
  }
  if (sameAs.length) {
    entity.sameAs = sameAs
  }
  return entity
}
