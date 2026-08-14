/**
 * Official Melega contracts — read-only aggregation from SSOTs.
 * Does not invent addresses. Does not modify registries.
 */
import { MELEGA_CHAIN_REGISTRY, type MelegaChainStatus } from 'config/melegaChainRegistry'
import {
  LB_CANONICAL_DEPLOYED_ADDRESSES,
  LB_CHAIN_ID,
  LB_MELEGA_AMM,
} from 'config/constants/liquidityBuildingDeployment'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_FACTORY_CHAIN_ID,
} from 'config/constants/createTokenFactoryDeployment'
import {
  PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT,
  PUBLIC_FARM_FACTORY_CHAIN_ID,
} from 'config/constants/publicFarmFactoryDeployment'
import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import {
  MELEGA_FEE_COLLECTOR_BSC,
  MELEGA_MASTERCHEF_BSC,
  MELEGA_SMARTCHEF_FACTORY_BSC,
  MELEGA_TREASURY_BSC,
  MELEGA_VAULT_BSC,
} from 'lib/bsc-indexer/constants'

const ADDR_RE = /^0x[a-fA-F0-9]{40}$/

export type ContractRuntime = 'READY' | 'LIVE' | 'PREPARING' | 'BOUND' | 'UNAVAILABLE'
export type OwnerHint = 'IMMUTABLE' | 'MULTISIG' | 'RENOUNCED' | 'UNAVAILABLE'
export type UpgradeHint = 'PROXY' | 'IMMUTABLE' | 'UNAVAILABLE'

export type OfficialContractRow = {
  id: string
  name: string
  role: string
  address: string
  chainId: number
  chainLabel: string
  chainStatus: MelegaChainStatus | 'CERTIFIED'
  verified: boolean
  live: boolean
  runtime: ContractRuntime
  owner: OwnerHint
  upgradeability: UpgradeHint
  proxy: boolean | null
  source: string
  weight: number
  score: number
  lastVerifiedLabel: string
}

function isAddr(v: string | null | undefined): v is string {
  return typeof v === 'string' && ADDR_RE.test(v)
}

function chainLabel(chainId: number): string {
  const row = MELEGA_CHAIN_REGISTRY.find((c) => c.chainId === chainId)
  return row?.shortLabel ?? `Chain ${chainId}`
}

/**
 * Transparent per-contract score (0–100):
 *   +40 valid address
 *   +25 LIVE chain (or +10 PREPARING / CERTIFIED suite)
 *   +20 bound in certified / SSOT package
 *   +15 verified flag from SSOT
 */
export function scoreOfficialContract(input: {
  address: string
  chainStatus: MelegaChainStatus | 'CERTIFIED'
  certified: boolean
  verified: boolean
}): number {
  let score = 0
  if (isAddr(input.address)) score += 40
  if (input.chainStatus === 'LIVE') score += 25
  else if (input.chainStatus === 'PREPARING' || input.chainStatus === 'CERTIFIED') score += 10
  if (input.certified) score += 20
  if (input.verified) score += 15
  return Math.min(100, score)
}

function push(
  out: OfficialContractRow[],
  partial: Omit<OfficialContractRow, 'score' | 'lastVerifiedLabel'> & { certified: boolean },
) {
  const score = scoreOfficialContract({
    address: partial.address,
    chainStatus: partial.chainStatus,
    certified: partial.certified,
    verified: partial.verified,
  })
  out.push({
    id: partial.id,
    name: partial.name,
    role: partial.role,
    address: partial.address,
    chainId: partial.chainId,
    chainLabel: partial.chainLabel,
    chainStatus: partial.chainStatus,
    verified: partial.verified,
    live: partial.live,
    runtime: partial.runtime,
    owner: partial.owner,
    upgradeability: partial.upgradeability,
    proxy: partial.proxy,
    source: partial.source,
    weight: partial.weight,
    score,
    lastVerifiedLabel: partial.certified || partial.verified ? 'SSOT bound' : 'Registry listed',
  })
}

export function buildOfficialContracts(): OfficialContractRow[] {
  const out: OfficialContractRow[] = []

  for (const chain of MELEGA_CHAIN_REGISTRY) {
    if (chain.status === 'DISABLED') continue
    const live = chain.status === 'LIVE'
    const runtime: ContractRuntime = live ? 'LIVE' : 'PREPARING'
    const entries: Array<{ key: keyof typeof chain.contracts; name: string; role: string; weight: number }> = [
      { key: 'factory', name: 'Factory', role: 'AMM Factory', weight: 1.2 },
      { key: 'router', name: 'Router', role: 'Swap Router', weight: 1.4 },
      { key: 'multicall', name: 'Multicall', role: 'Batch reads', weight: 0.6 },
      { key: 'masterBuilder', name: 'MasterBuilder / MasterChef', role: 'Farm controller', weight: 1.2 },
      { key: 'vault', name: 'Vault', role: 'Auto vault', weight: 0.9 },
      { key: 'poolDeploymentFactory', name: 'Pool Factory', role: 'Pool deployment', weight: 1.0 },
    ]
    for (const e of entries) {
      const address = chain.contracts[e.key]
      if (!isAddr(address)) continue
      push(out, {
        id: `${chain.chainId}-${e.key}`,
        name: e.name,
        role: e.role,
        address,
        chainId: chain.chainId,
        chainLabel: chain.shortLabel,
        chainStatus: chain.status,
        verified: live,
        live,
        runtime,
        owner: 'UNAVAILABLE',
        upgradeability: 'UNAVAILABLE',
        proxy: null,
        source: 'melegaChainRegistry',
        weight: e.weight,
        certified: live,
      })
    }
  }

  // Liquidity Building suite (BNB)
  const lbPairs: Array<{ key: keyof typeof LB_CANONICAL_DEPLOYED_ADDRESSES; name: string; role: string }> = [
    { key: 'lbFactory', name: 'Liquidity Building Factory', role: 'LB Factory' },
    { key: 'lbAuthorizer', name: 'LB Authorizer', role: 'LB Auth' },
    { key: 'lbFeeSink', name: 'LB Fee Sink', role: 'LB Fees' },
    { key: 'lbFeeReceiver', name: 'LB Fee Receiver', role: 'LB Fee receiver' },
    { key: 'lbProgramImplementation', name: 'LB Program Implementation', role: 'LB Implementation' },
    { key: 'lbExecutionMathLibrary', name: 'LB Execution Math', role: 'LB Library' },
  ]
  for (const e of lbPairs) {
    const address = LB_CANONICAL_DEPLOYED_ADDRESSES[e.key]
    if (!isAddr(address)) continue
    push(out, {
      id: `lb-${e.key}`,
      name: e.name,
      role: e.role,
      address,
      chainId: LB_CHAIN_ID,
      chainLabel: chainLabel(LB_CHAIN_ID),
      chainStatus: 'CERTIFIED',
      verified: true,
      live: true,
      runtime: 'READY',
      owner: 'UNAVAILABLE',
      upgradeability: 'PROXY',
      proxy: e.key === 'lbProgramImplementation' ? true : null,
      source: 'liquidityBuildingDeployment',
      weight: 1.1,
      certified: true,
    })
  }

  // AMM mirror from LB binding (dedupe by address+chain)
  for (const [name, address, role] of [
    ['Factory (LB AMM)', LB_MELEGA_AMM.factory, 'AMM Factory'],
    ['Router (LB AMM)', LB_MELEGA_AMM.router, 'Swap Router'],
  ] as const) {
    if (!isAddr(address)) continue
    const exists = out.some(
      (r) => r.chainId === LB_CHAIN_ID && r.address.toLowerCase() === address.toLowerCase(),
    )
    if (exists) continue
    push(out, {
      id: `lb-amm-${name}`,
      name,
      role,
      address,
      chainId: LB_CHAIN_ID,
      chainLabel: chainLabel(LB_CHAIN_ID),
      chainStatus: 'CERTIFIED',
      verified: true,
      live: true,
      runtime: 'READY',
      owner: 'UNAVAILABLE',
      upgradeability: 'UNAVAILABLE',
      proxy: null,
      source: 'liquidityBuildingDeployment',
      weight: 1.0,
      certified: true,
    })
  }

  // Create Token factory
  if (isAddr(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress)) {
    push(out, {
      id: 'create-token-factory',
      name: 'Token Factory',
      role: 'Create Token',
      address: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
      chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
      chainLabel: chainLabel(CREATE_TOKEN_FACTORY_CHAIN_ID),
      chainStatus: 'CERTIFIED',
      verified: CREATE_TOKEN_CANONICAL_DEPLOYMENT.verified,
      live: CREATE_TOKEN_CANONICAL_DEPLOYMENT.status === 'READY',
      runtime: 'READY',
      owner: 'IMMUTABLE',
      upgradeability: 'IMMUTABLE',
      proxy: false,
      source: 'createTokenFactoryDeployment',
      weight: 1.15,
      certified: true,
    })
  }

  // Public Farm Factory
  if (isAddr(PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress)) {
    push(out, {
      id: 'public-farm-factory',
      name: 'Farm Factory',
      role: 'Public Farm Factory',
      address: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.factoryAddress,
      chainId: PUBLIC_FARM_FACTORY_CHAIN_ID,
      chainLabel: chainLabel(PUBLIC_FARM_FACTORY_CHAIN_ID),
      chainStatus: 'CERTIFIED',
      verified: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.verified,
      live: PUBLIC_FARM_FACTORY_CANONICAL_DEPLOYMENT.status === 'READY',
      runtime: 'READY',
      owner: 'UNAVAILABLE',
      upgradeability: 'UNAVAILABLE',
      proxy: null,
      source: 'publicFarmFactoryDeployment',
      weight: 1.15,
      certified: true,
    })
  }

  // Treasury / fee / SmartChef / MasterChef / Vault (BSC indexer constants)
  const bscExtras: Array<{ id: string; name: string; role: string; address: string; weight: number }> = [
    {
      id: 'masterchef-bsc',
      name: 'MasterBuilder / MasterChef',
      role: 'Farm controller',
      address: MELEGA_MASTERCHEF_BSC,
      weight: 1.2,
    },
    { id: 'vault-bsc', name: 'Vault', role: 'Auto vault', address: MELEGA_VAULT_BSC, weight: 0.9 },
    { id: 'treasury-receiver', name: 'Treasury Receiver', role: 'Treasury', address: MELEGA_TREASURY_BSC, weight: 1.0 },
    { id: 'fee-collector', name: 'Fee Receiver', role: 'Fee collector', address: MELEGA_FEE_COLLECTOR_BSC, weight: 1.0 },
    {
      id: 'treasury-intake',
      name: 'Treasury Intake',
      role: 'Fee destination',
      address: MELEGA_TREASURY_FEE_DESTINATION,
      weight: 1.0,
    },
    {
      id: 'smartchef-factory',
      name: 'SmartChef / Pool Factory',
      role: 'Sous / pool factory',
      address: MELEGA_SMARTCHEF_FACTORY_BSC,
      weight: 0.9,
    },
  ]
  for (const e of bscExtras) {
    if (!isAddr(e.address)) continue
    const exists = out.some(
      (r) => r.chainId === 56 && r.address.toLowerCase() === e.address.toLowerCase(),
    )
    if (exists) continue
    push(out, {
      id: e.id,
      name: e.name,
      role: e.role,
      address: e.address,
      chainId: 56,
      chainLabel: 'BNB',
      chainStatus: 'LIVE',
      verified: true,
      live: true,
      runtime: 'LIVE',
      owner: 'UNAVAILABLE',
      upgradeability: 'UNAVAILABLE',
      proxy: null,
      source: 'bsc-indexer/constants + feeSchedule',
      weight: e.weight,
      certified: true,
    })
  }

  return out.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
}

export type MelegaScoreResult = {
  score: number
  weightedSum: number
  totalWeight: number
  contractCount: number
  formula: string
  measuredAt: number
}

/** Weighted mean of official contract scores — transparent Melega Score. */
export function computeMelegaScore(contracts: OfficialContractRow[], measuredAt = Date.now()): MelegaScoreResult {
  const totalWeight = contracts.reduce((s, c) => s + c.weight, 0)
  const weightedSum = contracts.reduce((s, c) => s + c.score * c.weight, 0)
  const score = totalWeight > 0 ? weightedSum / totalWeight : 0
  return {
    score: Math.round(score * 10) / 10,
    weightedSum,
    totalWeight,
    contractCount: contracts.length,
    formula:
      'MelegaScore = Σ(contractScoreᵢ × weightᵢ) / Σ(weightᵢ) · contractScore = 40·validAddr + 25·LIVE(+10 PREPARING/CERT) + 20·certified + 15·verified',
    measuredAt,
  }
}

export type DimensionId =
  | 'Health'
  | 'Security'
  | 'Availability'
  | 'Verification'
  | 'Infrastructure'
  | 'Runtime'
  | 'Transparency'
  | 'Indexer'
  | 'Liquidity'
  | 'Routing'
  | 'Wallet'
  | 'Oracle'
  | 'Bridge'
  | 'Deployment'

export type DimensionView = {
  id: DimensionId
  value: number | null
  tone: 'ok' | 'warn' | 'bad' | 'mute'
  detail: string
  trend: '—'
  delta: '—'
}

function toneFor(v: number | null): DimensionView['tone'] {
  if (v == null) return 'mute'
  if (v >= 85) return 'ok'
  if (v >= 60) return 'warn'
  return 'bad'
}

export function buildDimensions(input: {
  contracts: OfficialContractRow[]
  melegaScore: number
  readinessVerdict?: string | null
  healthStatus?: string | null
  indexingLag?: number | null
  storageConfigured?: boolean | null
  pairsTotal?: number | null
}): DimensionView[] {
  const { contracts, melegaScore } = input
  const liveShare =
    contracts.length > 0 ? (100 * contracts.filter((c) => c.live).length) / contracts.length : null
  const verifiedShare =
    contracts.length > 0 ? (100 * contracts.filter((c) => c.verified).length) / contracts.length : null
  const certifiedShare =
    contracts.length > 0
      ? (100 * contracts.filter((c) => c.source !== 'melegaChainRegistry' || c.live).length) / contracts.length
      : null
  const routerScore =
    contracts.filter((c) => /router/i.test(c.name) || /router/i.test(c.role)).reduce((s, c) => s + c.score, 0) /
      Math.max(1, contracts.filter((c) => /router/i.test(c.name) || /router/i.test(c.role)).length) || null
  const factoryScore =
    contracts.filter((c) => /factory/i.test(c.name)).reduce((s, c) => s + c.score, 0) /
      Math.max(1, contracts.filter((c) => /factory/i.test(c.name)).length) || null

  const lag = input.indexingLag
  const indexer =
    lag == null
      ? null
      : lag <= 50
        ? 98
        : lag <= 500
          ? 85
          : lag <= 5000
            ? 65
            : 40

  const readinessMap: Record<string, number> = {
    ready: 96,
    partial: 72,
    blocked: 35,
  }
  const runtime =
    input.readinessVerdict && readinessMap[input.readinessVerdict.toLowerCase()]
      ? readinessMap[input.readinessVerdict.toLowerCase()]
      : input.healthStatus === 'ok' || input.healthStatus === 'ready'
        ? 90
        : input.healthStatus
          ? 55
          : null

  const rows: Array<[DimensionId, number | null, string]> = [
    ['Health', melegaScore, 'Weighted Melega Score (official contracts SSOT)'],
    ['Security', verifiedShare, 'Verified contract share'],
    ['Availability', liveShare, 'LIVE contract share'],
    ['Verification', certifiedShare, 'SSOT / certified share'],
    ['Infrastructure', factoryScore, 'Factory contract average'],
    [
      'Runtime',
      runtime,
      'Runtime Readiness — separate live API health (not part of Melega Score weights)',
    ],
    ['Transparency', 100, 'Formula published on this page'],
    ['Indexer', indexer, lag == null ? 'Lag unavailable' : `Lag ${lag} blocks`],
    ['Liquidity', input.pairsTotal != null ? Math.min(100, 40 + Math.log10(Math.max(1, input.pairsTotal)) * 20) : null, 'Indexed markets'],
    ['Routing', routerScore, 'Router contract average'],
    ['Wallet', null, 'Not scored on Audit Center (wallet UX out of scope)'],
    ['Oracle', null, 'No dedicated oracle contract in SSOT'],
    ['Bridge', null, 'No bridge contract in SSOT'],
    [
      'Deployment',
      input.storageConfigured === false ? 40 : CREATE_TOKEN_CANONICAL_DEPLOYMENT.status === 'READY' ? 94 : 70,
      'LB / CT / PFF binding',
    ],
  ]

  return rows.map(([id, value, detail]) => ({
    id,
    value: value == null ? null : Math.round(value * 10) / 10,
    tone: toneFor(value),
    detail,
    trend: '—',
    delta: '—',
  }))
}

export type ChainBoardRow = {
  chainId: number
  label: string
  status: MelegaChainStatus
  score: number | null
  contracts: number
  block: number | null
  lag: number | null
}

export function buildChainBoard(
  contracts: OfficialContractRow[],
  indexer?: { chainHead?: number; indexingLag?: number; lastIndexedBlock?: number } | null,
): ChainBoardRow[] {
  return MELEGA_CHAIN_REGISTRY.filter((c) => c.status !== 'DISABLED').map((chain) => {
    const subset = contracts.filter((c) => c.chainId === chain.chainId)
    const totalW = subset.reduce((s, c) => s + c.weight, 0)
    const score =
      totalW > 0 ? Math.round((subset.reduce((s, c) => s + c.score * c.weight, 0) / totalW) * 10) / 10 : null
    const isBsc = chain.chainId === 56
    return {
      chainId: chain.chainId,
      label: chain.shortLabel,
      status: chain.status,
      score,
      contracts: subset.length,
      block: isBsc ? indexer?.lastIndexedBlock ?? indexer?.chainHead ?? null : null,
      lag: isBsc ? indexer?.indexingLag ?? null : null,
    }
  })
}
