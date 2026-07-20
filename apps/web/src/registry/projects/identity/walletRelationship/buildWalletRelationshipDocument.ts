import type { CanonicalProjectDocument } from '../types'
import type { ProjectEvidencePack } from '../evidence/types'
import { normalizeEvmAddress, toCaip2ChainId } from '../caip'
import {
  LIVE_SUPPORTED_RELATIONSHIP_TYPES,
  PROJECT_PAGE_WALLET_RELATIONSHIP_SUPPORT_EXTENSION,
  PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
  WALLET_RELATIONSHIP_LIMITATIONS,
  WALLET_RELATIONSHIP_RESOLVER_REVISION,
  type RelationshipType,
} from './schema'
import { buildObservationRevision, buildRelationshipId, normalizeWalletAccountInput } from './ids'
import type {
  LiveWalletObservation,
  ProjectWalletRelationshipDocument,
  RelevantCapability,
  WalletRelationshipError,
  WalletRelationshipRecord,
  WalletRelationshipSupportMetadata,
} from './types'

function projectTokenAddresses(document: CanonicalProjectDocument): Set<string> {
  const set = new Set<string>()
  for (const asset of document.assets) {
    const addr = asset.contractAddress ? normalizeEvmAddress(asset.contractAddress) : null
    if (addr) set.add(addr)
  }
  for (const contract of document.contracts) {
    const addr = normalizeEvmAddress(contract.address)
    if (addr) set.add(addr)
  }
  return set
}

function relatesToProject(tokenAddresses: string[], projectTokens: Set<string>): boolean {
  return tokenAddresses.some((a) => {
    const n = normalizeEvmAddress(a)
    return Boolean(n && projectTokens.has(n))
  })
}

function capabilityRelevance(
  document: CanonicalProjectDocument,
  hasAsset: boolean,
  hasLp: boolean,
  hasFarm: boolean,
  hasPool: boolean,
  hasClaimable: boolean,
): RelevantCapability[] {
  const map: Array<{
    key: string
    relevant: boolean
    reason: string
    href: string | null
    label: string | null
  }> = [
    {
      key: 'liquidity',
      relevant: hasAsset || hasLp,
      reason: hasLp ? 'ACTIVE_LP' : hasAsset ? 'HOLDS_PROJECT_ASSET' : 'NO_ASSET_OR_LP',
      href: '/liquidity-studio',
      label: hasLp ? 'View liquidity position' : 'Open Liquidity Studio',
    },
    {
      key: 'farm',
      relevant: hasFarm || hasLp,
      reason: hasFarm ? 'ACTIVE_FARM' : hasLp ? 'LP_MAY_BE_FARMABLE' : 'NO_FARM_OR_LP',
      href: '/farms',
      label: 'Open Farms Studio',
    },
    {
      key: 'pool',
      relevant: hasPool,
      reason: hasPool ? 'ACTIVE_POOL' : 'NO_POOL_POSITION',
      href: '/pools',
      label: 'Open Pools Studio',
    },
    {
      key: 'tradable',
      relevant: hasAsset,
      reason: hasAsset ? 'HOLDS_PROJECT_ASSET' : 'NO_PROJECT_ASSET',
      href: '/trade',
      label: 'Open Trade',
    },
  ]

  return map.map((entry): RelevantCapability => {
    const declared = document.declaredCapabilities.find((c) => c.key === entry.key)
    return {
      capabilityKey: entry.key,
      label: declared?.label ?? entry.key,
      relevance: entry.relevant ? ('RELEVANT' as const) : ('NOT_RELEVANT' as const),
      reasonCode: entry.reason,
      destination:
        entry.relevant && entry.href && entry.label
          ? { href: entry.href, label: entry.label }
          : entry.href && entry.label
            ? { href: entry.href, label: entry.label }
            : null,
    }
  }).concat(
    hasClaimable
      ? [
          {
            capabilityKey: 'claim_rewards',
            label: 'Claimable rewards',
            relevance: 'RELEVANT' as const,
            reasonCode: 'CLAIMABLE_PRESENT',
            destination: { href: '/command-center', label: 'View in Command Center' },
          },
        ]
      : [],
  )
}

/**
 * Single shared deterministic resolver — HTML hook and API must call this.
 * Live amounts come only from `observation` (client readers or test fixtures).
 */
export function buildWalletRelationshipDocument(input: {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  observation: LiveWalletObservation
  generatedAt?: string
}): ProjectWalletRelationshipDocument {
  const { document, evidencePack, observation } = input
  const generatedAt = input.generatedAt ?? observation.observedAt
  const errors: WalletRelationshipError[] = []
  const relationships: WalletRelationshipRecord[] = []
  const dataSources: string[] = ['registry.projects.identity', 'pp002.evidence']
  const projectTokens = projectTokenAddresses(document)
  const observedChains = new Set<number>()
  if (observation.activeChainId) observedChains.add(observation.activeChainId)

  if (observation.connectionState === 'DISCONNECTED' || !observation.walletAccountCaip10) {
    return {
      schemaVersion: PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
      projectId: document.projectId,
      slug: document.slug,
      walletAccount: null,
      walletConnectionState: observation.connectionState === 'CONNECTING' ? 'CONNECTING' : 'DISCONNECTED',
      observedChains: [],
      generatedAt,
      resolverRevision: WALLET_RELATIONSHIP_RESOLVER_REVISION,
      status: 'DISCONNECTED',
      availability: 'UNAVAILABLE',
      summary: {
        detectedRelationshipCount: 0,
        activeHoldingCount: 0,
        liquidityPositionCount: 0,
        farmPositionCount: 0,
        poolPositionCount: 0,
        claimableCount: 0,
        supportedCategories: [...LIVE_SUPPORTED_RELATIONSHIP_TYPES],
        unavailableCategories: ['GOVERNANCE_ELIGIBILITY', 'PROJECT_CONTROL', 'CONTRIBUTOR_ROLE'],
        partial: false,
      },
      relationships: [],
      relevantCapabilities: [],
      dataSources,
      errors: [
        {
          reasonCode: 'WALLET_DISCONNECTED',
          category: 'RESOLVER',
          message: 'Connect a wallet to evaluate project relationships.',
          chainId: null,
        },
      ],
      limitations: WALLET_RELATIONSHIP_LIMITATIONS,
    }
  }

  const walletAccount = normalizeWalletAccountInput(observation.walletAccountCaip10)
  if (!walletAccount) {
    return {
      schemaVersion: PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
      projectId: document.projectId,
      slug: document.slug,
      walletAccount: null,
      walletConnectionState: observation.connectionState,
      observedChains: [],
      generatedAt,
      resolverRevision: WALLET_RELATIONSHIP_RESOLVER_REVISION,
      status: 'INVALID_ACCOUNT',
      availability: 'UNAVAILABLE',
      summary: {
        detectedRelationshipCount: 0,
        activeHoldingCount: 0,
        liquidityPositionCount: 0,
        farmPositionCount: 0,
        poolPositionCount: 0,
        claimableCount: 0,
        supportedCategories: [...LIVE_SUPPORTED_RELATIONSHIP_TYPES],
        unavailableCategories: ['GOVERNANCE_ELIGIBILITY', 'PROJECT_CONTROL', 'CONTRIBUTOR_ROLE'],
        partial: false,
      },
      relationships: [],
      relevantCapabilities: [],
      dataSources,
      errors: [
        {
          reasonCode: 'ACCOUNT_INVALID',
          category: 'RESOLVER',
          message: 'Wallet account must be a valid CAIP-10 identifier.',
          chainId: null,
        },
      ],
      limitations: WALLET_RELATIONSHIP_LIMITATIONS,
    }
  }

  // --- Asset holdings ---
  if (document.assets.length === 0) {
    errors.push({
      reasonCode: 'PROJECT_HAS_NO_REGISTERED_ASSETS',
      category: 'ASSET_HOLDING',
      message: 'Project has no registered assets for holding evaluation.',
      chainId: null,
    })
  } else if (observation.assetBalances === null) {
    errors.push({
      reasonCode: observation.assetBalanceReason ?? 'BALANCE_READ_UNAVAILABLE',
      category: 'ASSET_HOLDING',
      message: 'Asset balance reader unavailable for this observation.',
      chainId: observation.activeChainId,
    })
  } else {
    dataSources.push(observation.assetBalances[0]?.source ?? 'wallet.balanceOf')
    const seen = new Set<string>()
    for (const bal of observation.assetBalances) {
      const key = `${bal.chainId}:${bal.contractAddress.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      observedChains.add(bal.chainId)
      const isZero = bal.rawAmount === '0'
      relationships.push({
        relationshipId: buildRelationshipId({
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'ASSET_HOLDING',
          subjectId: bal.assetId,
          chainId: bal.chainId,
        }),
        projectId: document.projectId,
        walletAccount,
        relationshipType: 'ASSET_HOLDING',
        subject: { subjectType: 'ASSET', subjectId: bal.assetId, label: bal.symbol },
        chainId: bal.chainId,
        caip2: toCaip2ChainId(bal.chainId),
        status: isZero ? 'INACTIVE' : 'ACTIVE',
        availability: 'AVAILABLE',
        source: bal.source,
        observedAt: bal.observedAt,
        updatedAt: bal.observedAt,
        dataRevision: buildObservationRevision([bal.assetId, bal.rawAmount, String(bal.chainId)]),
        relatedAssetIds: [bal.assetId],
        relatedContractIds: [],
        relatedCapabilityIds: isZero ? [] : ['tradable', 'liquidity'],
        positionReference: null,
        rawAmount: bal.rawAmount,
        formattedAmount: bal.formattedAmount,
        displaySummary: isZero
          ? `${bal.symbol}: 0 (observed)`
          : `${bal.symbol}: ${bal.formattedAmount}`,
        deepLink: isZero ? null : { href: '/trade', label: 'Open Trade' },
        limitations: ['Zero is a valid observed balance, not an error.'],
        reasonCode: isZero ? 'ZERO_BALANCE' : null,
      })
    }
  }

  // --- Liquidity ---
  if (observation.liquidityPositions === null) {
    errors.push({
      reasonCode: observation.liquidityReason ?? 'LIQUIDITY_READER_UNAVAILABLE',
      category: 'LIQUIDITY_POSITION',
      message: 'Liquidity position reader unavailable.',
      chainId: observation.activeChainId,
    })
  } else {
    dataSources.push('liquidityStudio.useLiquidityPositions')
    const seen = new Set<string>()
    for (const pos of observation.liquidityPositions) {
      if (!relatesToProject(pos.tokenAddresses, projectTokens)) continue
      const key = pos.pairAddress.toLowerCase()
      if (seen.has(key)) continue
      seen.add(key)
      observedChains.add(pos.chainId)
      relationships.push({
        relationshipId: buildRelationshipId({
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'LIQUIDITY_POSITION',
          subjectId: pos.pairAddress.toLowerCase(),
          chainId: pos.chainId,
        }),
        projectId: document.projectId,
        walletAccount,
        relationshipType: 'LIQUIDITY_POSITION',
        subject: { subjectType: 'PAIR', subjectId: pos.pairAddress.toLowerCase(), label: pos.pairLabel },
        chainId: pos.chainId,
        caip2: toCaip2ChainId(pos.chainId),
        status: 'ACTIVE',
        availability: 'AVAILABLE',
        source: pos.source,
        observedAt: pos.observedAt,
        updatedAt: pos.observedAt,
        dataRevision: buildObservationRevision([pos.positionId, pos.lpRawAmount]),
        relatedAssetIds: document.assets
          .filter((a) => a.contractAddress && pos.tokenAddresses.some((t) => normalizeEvmAddress(t) === a.contractAddress))
          .map((a) => a.assetId),
        relatedContractIds: [],
        relatedCapabilityIds: ['liquidity'],
        positionReference: pos.positionId,
        rawAmount: pos.lpRawAmount,
        formattedAmount: pos.lpFormattedAmount,
        displaySummary: `Liquidity: ${pos.pairLabel} · LP ${pos.lpFormattedAmount}`,
        deepLink: { href: '/liquidity-studio', label: 'View liquidity position' },
        limitations: ['LP attribution requires both pool tokens mapped to project assets/contracts.'],
        reasonCode: null,
      })
    }
  }

  // --- Farms ---
  if (observation.farmPositions === null) {
    errors.push({
      reasonCode: observation.farmReason ?? 'FARM_READER_UNAVAILABLE',
      category: 'FARM_POSITION',
      message: 'Farm position reader unavailable.',
      chainId: observation.activeChainId,
    })
  } else {
    dataSources.push('farmsStudio.useFarmsStakingRuntime')
    const seen = new Set<string>()
    for (const pos of observation.farmPositions) {
      if (!relatesToProject(pos.relatedTokenAddresses, projectTokens)) continue
      if (projectTokens.size === 0) continue
      const key = `${pos.chainId}:${pos.farmId}`
      if (seen.has(key)) continue
      seen.add(key)
      observedChains.add(pos.chainId)
      relationships.push({
        relationshipId: buildRelationshipId({
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'FARM_POSITION',
          subjectId: pos.farmId,
          chainId: pos.chainId,
        }),
        projectId: document.projectId,
        walletAccount,
        relationshipType: 'FARM_POSITION',
        subject: { subjectType: 'FARM', subjectId: pos.farmId, label: pos.label },
        chainId: pos.chainId,
        caip2: toCaip2ChainId(pos.chainId),
        status: 'ACTIVE',
        availability: 'AVAILABLE',
        source: pos.source,
        observedAt: pos.observedAt,
        updatedAt: pos.observedAt,
        dataRevision: buildObservationRevision([pos.positionId, pos.stakedRawAmount]),
        relatedAssetIds: [],
        relatedContractIds: [],
        relatedCapabilityIds: ['farm'],
        positionReference: pos.positionId,
        rawAmount: pos.stakedRawAmount,
        formattedAmount: pos.stakedFormattedAmount,
        displaySummary: `Farm: ${pos.label} · staked ${pos.stakedFormattedAmount}`,
        deepLink: { href: '/farms', label: 'Open Farms Studio' },
        limitations: [],
        reasonCode: null,
      })
      if (pos.pendingRewardRaw && pos.pendingRewardRaw !== '0') {
        relationships.push({
          relationshipId: buildRelationshipId({
            projectId: document.projectId,
            walletAccount,
            relationshipType: 'CLAIMABLE_REWARD',
            subjectId: `farm-reward:${pos.farmId}`,
            chainId: pos.chainId,
          }),
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'CLAIMABLE_REWARD',
          subject: {
            subjectType: 'REWARD',
            subjectId: `farm-reward:${pos.farmId}`,
            label: `${pos.label} rewards`,
          },
          chainId: pos.chainId,
          caip2: toCaip2ChainId(pos.chainId),
          status: 'CLAIMABLE',
          availability: 'AVAILABLE',
          source: pos.source,
          observedAt: pos.observedAt,
          updatedAt: pos.observedAt,
          dataRevision: buildObservationRevision([pos.farmId, pos.pendingRewardRaw]),
          relatedAssetIds: [],
          relatedContractIds: [],
          relatedCapabilityIds: ['farm'],
          positionReference: pos.positionId,
          rawAmount: pos.pendingRewardRaw,
          formattedAmount: pos.pendingRewardFormatted,
          displaySummary: `Claimable farm rewards: ${pos.pendingRewardFormatted ?? pos.pendingRewardRaw}`,
          deepLink: { href: '/command-center', label: 'Review claimable rewards' },
          limitations: ['PP004 does not prepare or execute claims.'],
          reasonCode: null,
        })
      }
    }
  }

  // --- Pools ---
  if (observation.poolPositions === null) {
    errors.push({
      reasonCode: observation.poolReason ?? 'POOL_READER_UNAVAILABLE',
      category: 'POOL_POSITION',
      message: 'Pool position reader unavailable.',
      chainId: observation.activeChainId,
    })
  } else {
    dataSources.push('poolsStudio.usePoolsStakingRuntime')
    const seen = new Set<string>()
    for (const pos of observation.poolPositions) {
      if (!relatesToProject(pos.relatedTokenAddresses, projectTokens)) continue
      if (projectTokens.size === 0) continue
      const key = `${pos.chainId}:${pos.poolId}`
      if (seen.has(key)) continue
      seen.add(key)
      observedChains.add(pos.chainId)
      relationships.push({
        relationshipId: buildRelationshipId({
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'POOL_POSITION',
          subjectId: pos.poolId,
          chainId: pos.chainId,
        }),
        projectId: document.projectId,
        walletAccount,
        relationshipType: 'POOL_POSITION',
        subject: { subjectType: 'POOL', subjectId: pos.poolId, label: pos.label },
        chainId: pos.chainId,
        caip2: toCaip2ChainId(pos.chainId),
        status: 'ACTIVE',
        availability: 'AVAILABLE',
        source: pos.source,
        observedAt: pos.observedAt,
        updatedAt: pos.observedAt,
        dataRevision: buildObservationRevision([pos.positionId, pos.stakedRawAmount]),
        relatedAssetIds: [],
        relatedContractIds: [],
        relatedCapabilityIds: ['pool'],
        positionReference: pos.positionId,
        rawAmount: pos.stakedRawAmount,
        formattedAmount: pos.stakedFormattedAmount,
        displaySummary: `Pool: ${pos.label} · staked ${pos.stakedFormattedAmount}`,
        deepLink: { href: '/pools', label: 'Open Pools Studio' },
        limitations: [],
        reasonCode: null,
      })
      if (pos.pendingRewardRaw && pos.pendingRewardRaw !== '0') {
        relationships.push({
          relationshipId: buildRelationshipId({
            projectId: document.projectId,
            walletAccount,
            relationshipType: 'CLAIMABLE_REWARD',
            subjectId: `pool-reward:${pos.poolId}`,
            chainId: pos.chainId,
          }),
          projectId: document.projectId,
          walletAccount,
          relationshipType: 'CLAIMABLE_REWARD',
          subject: {
            subjectType: 'REWARD',
            subjectId: `pool-reward:${pos.poolId}`,
            label: `${pos.label} rewards`,
          },
          chainId: pos.chainId,
          caip2: toCaip2ChainId(pos.chainId),
          status: 'CLAIMABLE',
          availability: 'AVAILABLE',
          source: pos.source,
          observedAt: pos.observedAt,
          updatedAt: pos.observedAt,
          dataRevision: buildObservationRevision([pos.poolId, pos.pendingRewardRaw]),
          relatedAssetIds: [],
          relatedContractIds: [],
          relatedCapabilityIds: ['pool'],
          positionReference: pos.positionId,
          rawAmount: pos.pendingRewardRaw,
          formattedAmount: pos.pendingRewardFormatted,
          displaySummary: `Claimable pool rewards: ${pos.pendingRewardFormatted ?? pos.pendingRewardRaw}`,
          deepLink: { href: '/command-center', label: 'Review claimable rewards' },
          limitations: ['PP004 does not prepare or execute claims.'],
          reasonCode: null,
        })
      }
    }
  }

  // --- Unsupported categories (honest) ---
  relationships.push({
    relationshipId: buildRelationshipId({
      projectId: document.projectId,
      walletAccount,
      relationshipType: 'GOVERNANCE_ELIGIBILITY',
      subjectId: 'governance',
      chainId: null,
    }),
    projectId: document.projectId,
    walletAccount,
    relationshipType: 'GOVERNANCE_ELIGIBILITY',
    subject: { subjectType: 'GOVERNANCE', subjectId: 'governance', label: 'Governance' },
    chainId: null,
    caip2: null,
    status: 'UNRESOLVED',
    availability: 'UNAVAILABLE',
    source: 'registry',
    observedAt: generatedAt,
    updatedAt: generatedAt,
    dataRevision: 'none',
    relatedAssetIds: [],
    relatedContractIds: [],
    relatedCapabilityIds: [],
    positionReference: null,
    rawAmount: null,
    formattedAmount: null,
    displaySummary: 'Governance eligibility is not registered for deterministic evaluation.',
    deepLink: null,
    limitations: [],
    reasonCode: 'GOVERNANCE_NOT_REGISTERED',
  })

  // PP002 control evidence is public-safe summary only; wallet attribution is never inferred.
  void evidencePack.summary.controlEvidenceAvailable
  relationships.push({
    relationshipId: buildRelationshipId({
      projectId: document.projectId,
      walletAccount,
      relationshipType: 'PROJECT_CONTROL',
      subjectId: 'project-control',
      chainId: null,
    }),
    projectId: document.projectId,
    walletAccount,
    relationshipType: 'PROJECT_CONTROL',
    subject: { subjectType: 'CONTROL', subjectId: 'project-control', label: 'Project control' },
    chainId: null,
    caip2: null,
    status: 'UNRESOLVED',
    availability: 'UNAVAILABLE',
    source: 'pp002.evidence',
    observedAt: generatedAt,
    updatedAt: generatedAt,
    dataRevision: 'none',
    relatedAssetIds: [],
    relatedContractIds: [],
    relatedCapabilityIds: [],
    positionReference: null,
    rawAmount: null,
    formattedAmount: null,
    displaySummary: 'No public project-control evidence links this wallet to project control.',
    deepLink: null,
    limitations: ['Private control evidence is never used.'],
    reasonCode: 'CONTROL_EVIDENCE_UNAVAILABLE',
  })

  relationships.push({
    relationshipId: buildRelationshipId({
      projectId: document.projectId,
      walletAccount,
      relationshipType: 'CONTRIBUTOR_ROLE',
      subjectId: 'contributor',
      chainId: null,
    }),
    projectId: document.projectId,
    walletAccount,
    relationshipType: 'CONTRIBUTOR_ROLE',
    subject: { subjectType: 'ROLE', subjectId: 'contributor', label: 'Contributor' },
    chainId: null,
    caip2: null,
    status: 'UNRESOLVED',
    availability: 'UNAVAILABLE',
    source: 'registry',
    observedAt: generatedAt,
    updatedAt: generatedAt,
    dataRevision: 'none',
    relatedAssetIds: [],
    relatedContractIds: [],
    relatedCapabilityIds: [],
    positionReference: null,
    rawAmount: null,
    formattedAmount: null,
    displaySummary: 'Contributor roles are not available from current canonical sources.',
    deepLink: null,
    limitations: [],
    reasonCode: 'CONTRIBUTOR_ROLE_UNAVAILABLE',
  })

  const activeHoldings = relationships.filter(
    (r) => r.relationshipType === 'ASSET_HOLDING' && r.status === 'ACTIVE',
  )
  const lp = relationships.filter((r) => r.relationshipType === 'LIQUIDITY_POSITION' && r.status === 'ACTIVE')
  const farms = relationships.filter((r) => r.relationshipType === 'FARM_POSITION' && r.status === 'ACTIVE')
  const pools = relationships.filter((r) => r.relationshipType === 'POOL_POSITION' && r.status === 'ACTIVE')
  const claimables = relationships.filter((r) => r.relationshipType === 'CLAIMABLE_REWARD' && r.status === 'CLAIMABLE')

  const detected = [...activeHoldings, ...lp, ...farms, ...pools, ...claimables]
  const partial = errors.some((e) =>
    [
      'BALANCE_READ_UNAVAILABLE',
      'LIQUIDITY_READER_UNAVAILABLE',
      'FARM_READER_UNAVAILABLE',
      'POOL_READER_UNAVAILABLE',
      'REWARD_READER_UNAVAILABLE',
      'PARTIAL_CHAIN_COVERAGE',
      'LIVE_READ_CLIENT_REQUIRED',
      'RPC_UNAVAILABLE',
      'CHAIN_UNSUPPORTED',
    ].includes(e.reasonCode),
  )

  const relevantCapabilities = capabilityRelevance(
    document,
    activeHoldings.length > 0,
    lp.length > 0,
    farms.length > 0,
    pools.length > 0,
    claimables.length > 0,
  )

  // Capability eligibility rows (presentation of relevance — not execution)
  for (const cap of relevantCapabilities.filter((c) => c.relevance === 'RELEVANT')) {
    relationships.push({
      relationshipId: buildRelationshipId({
        projectId: document.projectId,
        walletAccount,
        relationshipType: 'CAPABILITY_ELIGIBILITY',
        subjectId: cap.capabilityKey,
        chainId: observation.activeChainId,
      }),
      projectId: document.projectId,
      walletAccount,
      relationshipType: 'CAPABILITY_ELIGIBILITY',
      subject: {
        subjectType: 'CAPABILITY',
        subjectId: cap.capabilityKey,
        label: cap.label,
      },
      chainId: observation.activeChainId,
      caip2: observation.activeChainId ? toCaip2ChainId(observation.activeChainId) : null,
      status: 'ELIGIBLE',
      availability: 'AVAILABLE',
      source: 'derived.capabilityRelevance',
      observedAt: generatedAt,
      updatedAt: generatedAt,
      dataRevision: buildObservationRevision([cap.capabilityKey, cap.reasonCode]),
      relatedAssetIds: [],
      relatedContractIds: [],
      relatedCapabilityIds: [cap.capabilityKey],
      positionReference: null,
      rawAmount: null,
      formattedAmount: null,
      displaySummary: `Relevant capability: ${cap.label}`,
      deepLink: cap.destination,
      limitations: ['Relevance only — no executable transaction descriptor.'],
      reasonCode: null,
    })
  }

  relationships.sort((a, b) => a.relationshipId.localeCompare(b.relationshipId))

  return {
    schemaVersion: PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
    projectId: document.projectId,
    slug: document.slug,
    walletAccount,
    walletConnectionState: observation.connectionState,
    observedChains: [...observedChains].sort((a, b) => a - b),
    generatedAt,
    resolverRevision: WALLET_RELATIONSHIP_RESOLVER_REVISION,
    status: partial ? 'PARTIAL' : 'OK',
    availability: partial ? 'UNAVAILABLE' : 'AVAILABLE',
    summary: {
      detectedRelationshipCount: detected.length,
      activeHoldingCount: activeHoldings.length,
      liquidityPositionCount: lp.length,
      farmPositionCount: farms.length,
      poolPositionCount: pools.length,
      claimableCount: claimables.length,
      supportedCategories: [...LIVE_SUPPORTED_RELATIONSHIP_TYPES],
      unavailableCategories: ['GOVERNANCE_ELIGIBILITY', 'PROJECT_CONTROL', 'CONTRIBUTOR_ROLE'],
      partial,
    },
    relationships,
    relevantCapabilities,
    dataSources: [...new Set(dataSources)].sort(),
    errors,
    limitations: WALLET_RELATIONSHIP_LIMITATIONS,
  }
}

export function buildWalletRelationshipSupportMetadata(slug: string): WalletRelationshipSupportMetadata {
  return {
    extension: PROJECT_PAGE_WALLET_RELATIONSHIP_SUPPORT_EXTENSION,
    supported: true,
    resolverRevision: WALLET_RELATIONSHIP_RESOLVER_REVISION,
    schemaVersion: PROJECT_WALLET_RELATIONSHIP_SCHEMA_VERSION,
    supportedCategories: [...LIVE_SUPPORTED_RELATIONSHIP_TYPES] as RelationshipType[],
    contextualApiPath: `/api/projects/${slug}/wallet-relationship/`,
    notes: [
      'Wallet relationships are contextual and never included in SEO or JSON-LD.',
      'Live balances and positions are resolved client-side via existing Melega readers.',
    ],
  }
}

export function disconnectedObservation(observedAt: string): LiveWalletObservation {
  return {
    walletAccountCaip10: null,
    connectionState: 'DISCONNECTED',
    activeChainId: null,
    observedAt,
    assetBalances: null,
    assetBalanceAvailability: 'UNAVAILABLE',
    assetBalanceReason: 'WALLET_DISCONNECTED',
    liquidityPositions: null,
    liquidityAvailability: 'UNAVAILABLE',
    liquidityReason: 'WALLET_DISCONNECTED',
    farmPositions: null,
    farmAvailability: 'UNAVAILABLE',
    farmReason: 'WALLET_DISCONNECTED',
    poolPositions: null,
    poolAvailability: 'UNAVAILABLE',
    poolReason: 'WALLET_DISCONNECTED',
  }
}
