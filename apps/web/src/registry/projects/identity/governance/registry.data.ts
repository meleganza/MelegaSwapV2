/**
 * Certified Governance & Treasury Transparency registry — PP011 read model.
 * Honest disclosure only. No balances. No invented PUBLIC_VERIFIED.
 */
import type {
  RegistryGovernanceRecord,
  RegistryGovernanceRelationRecord,
  RegistryGovernanceResourceRecord,
  RegistryOwnershipRecord,
  RegistryTreasuryRecord,
  RegistryUpgradeabilityRecord,
} from './types'

const UPDATED = '2026-07-21T00:00:00.000Z'

export const PROJECT_GOVERNANCE_RECORDS: RegistryGovernanceRecord[] = [
  {
    stableKey: 'melega-dex.gov.primary',
    projectSlug: 'melega-dex',
    governanceModel: 'UNKNOWN',
    lifecycle: 'UNAVAILABLE',
    summary:
      'No on-chain DAO, multisig controller, foundation charter, or timelock is registered in the Melega project registry. Governance execution is not exposed on the Project Page.',
    supportedChains: [56],
    governanceCapabilities: ['TREASURY_DISCLOSURE'],
    governanceContractRefs: [],
    evidenceClaimTypes: ['PROJECT_CONTROL', 'OFFICIAL_GOVERNANCE'],
    provenanceSourceClass: 'UNKNOWN',
    relatedSectionIds: ['trust', 'ecosystem', 'developer'],
    relatedServiceStableKeys: ['melega-dex.service.treasury', 'melega-dex.service.docs'],
    relatedUpdateStableKeys: ['melega-dex.provenance-evidence-framework'],
    relatedDeveloperStableKeys: ['melega-dex.dev.docs-about', 'melega-dex.dev.api.project-page'],
    machineTags: ['governance', 'unknown', 'disclosure'],
    updatedAt: UPDATED,
  },
]

export const PROJECT_TREASURY_RECORDS: RegistryTreasuryRecord[] = [
  {
    stableKey: 'melega-dex.treasury.intake-97',
    projectSlug: 'melega-dex',
    treasuryType: 'REVENUE',
    walletAddress: '0xe674b1d925d79f5A0053e40cC7cdED7841AD4164',
    chainId: 97,
    disclosureLevel: 'PUBLIC_DECLARED',
    lifecycle: 'ACTIVE',
    summary:
      'Treasury Intake collector registered for BNB Testnet in the Treasury Runtime registry (active_testnet). Disclosure only — no balances.',
    evidenceClaimTypes: [],
    provenanceSourceClass: 'MELEGA_VERIFIED',
    relatedSectionIds: ['ecosystem', 'developer'],
    relatedServiceStableKeys: ['melega-dex.service.treasury'],
    relatedUpdateStableKeys: [],
    machineTags: ['treasury', 'intake', 'testnet', 'collector'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.treasury.intake-56',
    projectSlug: 'melega-dex',
    treasuryType: 'REVENUE',
    walletAddress: null,
    chainId: 56,
    disclosureLevel: 'UNAVAILABLE',
    lifecycle: 'PLANNED',
    summary:
      'BNB Chain mainnet Treasury Intake collector is planned; registry lists collector as null. No mainnet collector address is disclosed here.',
    evidenceClaimTypes: [],
    provenanceSourceClass: 'PROJECT_ATTESTED',
    relatedSectionIds: ['ecosystem'],
    relatedServiceStableKeys: ['melega-dex.service.treasury'],
    relatedUpdateStableKeys: [],
    machineTags: ['treasury', 'intake', 'mainnet', 'planned'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.treasury.capability',
    projectSlug: 'melega-dex',
    treasuryType: 'PROTOCOL_TREASURY',
    walletAddress: null,
    chainId: 56,
    disclosureLevel: 'PARTIAL',
    lifecycle: 'PLANNED',
    summary:
      'Project capability treasuryCompatible is planned (MARCO fee SKUs / Treasury Runtime Phase 2). No certified mainnet treasury wallet is registered on the Project Page.',
    evidenceClaimTypes: [],
    provenanceSourceClass: 'PROJECT_ATTESTED',
    relatedSectionIds: ['ecosystem', 'trust'],
    relatedServiceStableKeys: ['melega-dex.service.treasury'],
    relatedUpdateStableKeys: [],
    machineTags: ['treasury', 'capability', 'planned'],
    updatedAt: UPDATED,
  },
]

export const PROJECT_OWNERSHIP_RECORDS: RegistryOwnershipRecord[] = [
  {
    stableKey: 'melega-dex.own.wrapper',
    projectSlug: 'melega-dex',
    ownerModel: 'OWNABLE',
    proxyModel: 'NONE',
    timelockModel: 'NONE',
    subjectLabel: 'MelegaSmartRouterWrapper',
    summary:
      'Smart Router Wrapper Solidity uses OpenZeppelin Ownable + Pausable. Current owner address is not published in the project registry.',
    contractAddress: null,
    chainId: 56,
    evidenceClaimTypes: ['PROJECT_CONTROL'],
    provenanceSourceClass: 'PROJECT_ATTESTED',
    relatedSectionIds: ['developer', 'trust'],
    relatedDeveloperStableKeys: ['melega-dex.dev.api.project-page'],
    machineTags: ['ownership', 'ownable', 'wrapper'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.own.amm-core',
    projectSlug: 'melega-dex',
    ownerModel: 'UNKNOWN',
    proxyModel: 'UNKNOWN',
    timelockModel: 'UNKNOWN',
    subjectLabel: 'AMM Factory / Router / MasterChef',
    summary:
      'Core AMM contract addresses are listed in developer/deployments surfaces; admin owner, proxy, and timelock controllers are not certified in the project registry.',
    contractAddress: null,
    chainId: 56,
    evidenceClaimTypes: ['PROJECT_CONTROL'],
    provenanceSourceClass: 'UNKNOWN',
    relatedSectionIds: ['developer', 'trust'],
    relatedDeveloperStableKeys: [],
    machineTags: ['ownership', 'amm', 'unknown'],
    updatedAt: UPDATED,
  },
]

export const PROJECT_UPGRADEABILITY_RECORDS: RegistryUpgradeabilityRecord[] = [
  {
    stableKey: 'melega-dex.upg.wrapper',
    projectSlug: 'melega-dex',
    upgradeability: 'IMMUTABLE',
    subjectLabel: 'MelegaSmartRouterWrapper',
    summary:
      'Wrapper deployment pattern is non-proxy Ownable (pause/unpause). No Transparent/UUPS proxy upgrade path is registered for this subject.',
    contractAddress: null,
    chainId: 56,
    evidenceClaimTypes: [],
    provenanceSourceClass: 'PROJECT_ATTESTED',
    relatedSectionIds: ['developer'],
    relatedDeveloperStableKeys: [],
    machineTags: ['upgradeability', 'immutable', 'wrapper'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.upg.amm-core',
    projectSlug: 'melega-dex',
    upgradeability: 'UNKNOWN',
    subjectLabel: 'AMM core stack',
    summary:
      'No certified proxy/upgradeability analysis is bound to the Project Page for Factory, Router, or MasterChef.',
    contractAddress: null,
    chainId: 56,
    evidenceClaimTypes: [],
    provenanceSourceClass: 'UNKNOWN',
    relatedSectionIds: ['developer', 'trust'],
    relatedDeveloperStableKeys: [],
    machineTags: ['upgradeability', 'amm', 'unknown'],
    updatedAt: UPDATED,
  },
]

export const PROJECT_GOVERNANCE_RESOURCES: RegistryGovernanceResourceRecord[] = [
  {
    stableKey: 'melega-dex.gov.res.treasury-registry',
    projectSlug: 'melega-dex',
    kind: 'REGISTRY',
    title: 'Treasury Runtime registry',
    summary: 'Machine-readable Treasury Intake chain status and collector disclosure (read-only).',
    url: null,
    route: '/registry/treasury/index.json',
    lifecycle: 'ACTIVE',
    evidenceClaimTypes: [],
    provenanceSourceClass: 'MELEGA_VERIFIED',
    relatedSectionIds: ['ecosystem'],
    machineTags: ['treasury', 'registry', 'json'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.gov.res.docs-about',
    projectSlug: 'melega-dex',
    kind: 'DOCUMENTATION',
    title: 'Project documentation (About)',
    summary: 'Official About / documentation landing. Not a governance portal or voting surface.',
    url: 'https://www.melega.finance/about',
    route: null,
    lifecycle: 'ACTIVE',
    evidenceClaimTypes: ['OFFICIAL_DOCUMENTATION'],
    provenanceSourceClass: 'MELEGA_VERIFIED',
    relatedSectionIds: ['developer', 'ecosystem'],
    machineTags: ['docs', 'about'],
    updatedAt: UPDATED,
  },
  {
    stableKey: 'melega-dex.gov.res.governance-portal',
    projectSlug: 'melega-dex',
    kind: 'PORTAL',
    title: 'Governance portal',
    summary: 'No Snapshot, Tally, Boardroom, or other governance portal is registered for Melega DEX.',
    url: null,
    route: null,
    lifecycle: 'UNAVAILABLE',
    evidenceClaimTypes: ['OFFICIAL_GOVERNANCE'],
    provenanceSourceClass: 'UNKNOWN',
    relatedSectionIds: ['trust'],
    machineTags: ['governance', 'portal', 'unavailable'],
    updatedAt: UPDATED,
  },
]

export const PROJECT_GOVERNANCE_RELATIONS: RegistryGovernanceRelationRecord[] = [
  {
    fromStableKey: 'melega-dex.gov.primary',
    toStableKey: 'melega-dex.gov.res.docs-about',
    relationType: 'DOCUMENTS',
  },
  {
    fromStableKey: 'melega-dex.gov.primary',
    toStableKey: 'melega-dex.gov.res.governance-portal',
    relationType: 'DISCLOSES',
  },
  {
    fromStableKey: 'melega-dex.treasury.intake-97',
    toStableKey: 'melega-dex.gov.res.treasury-registry',
    relationType: 'DISCLOSES',
  },
]

export function listGovernanceRecordsForSlug(slug: string): RegistryGovernanceRecord[] {
  return PROJECT_GOVERNANCE_RECORDS.filter((r) => r.projectSlug === slug)
}

export function listTreasuryRecordsForSlug(slug: string): RegistryTreasuryRecord[] {
  return PROJECT_TREASURY_RECORDS.filter((r) => r.projectSlug === slug)
}

export function listOwnershipRecordsForSlug(slug: string): RegistryOwnershipRecord[] {
  return PROJECT_OWNERSHIP_RECORDS.filter((r) => r.projectSlug === slug)
}

export function listUpgradeabilityRecordsForSlug(slug: string): RegistryUpgradeabilityRecord[] {
  return PROJECT_UPGRADEABILITY_RECORDS.filter((r) => r.projectSlug === slug)
}

export function listGovernanceResourcesForSlug(slug: string): RegistryGovernanceResourceRecord[] {
  return PROJECT_GOVERNANCE_RESOURCES.filter((r) => r.projectSlug === slug)
}

export function listGovernanceRelationsForSlug(slug: string): RegistryGovernanceRelationRecord[] {
  const keys = new Set([
    ...listGovernanceRecordsForSlug(slug).map((r) => r.stableKey),
    ...listTreasuryRecordsForSlug(slug).map((r) => r.stableKey),
    ...listOwnershipRecordsForSlug(slug).map((r) => r.stableKey),
    ...listUpgradeabilityRecordsForSlug(slug).map((r) => r.stableKey),
    ...listGovernanceResourcesForSlug(slug).map((r) => r.stableKey),
  ])
  return PROJECT_GOVERNANCE_RELATIONS.filter((r) => keys.has(r.fromStableKey) && keys.has(r.toStableKey))
}
