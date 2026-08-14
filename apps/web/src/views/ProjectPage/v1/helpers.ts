import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { canonicalProjectPath } from 'registry/projects/identity'
import type { CanonicalProjectAsset, CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ParticipationOpportunityRecord } from 'registry/projects/identity/participation'
import {
  getMelegaChain,
  getMelegaPreparingChains,
  getMelegaRouterAddress,
  isMelegaChainLive,
  type MelegaChainRecord,
  type MelegaChainStatus,
} from 'config/melegaChainRegistry'

export type ProjectChainDeployment = {
  chainId: number
  label: string
  shortLabel: string
  status: MelegaChainStatus
  comingSoon: boolean
  asset: CanonicalProjectAsset | null
  contractAddress: string | null
  explorerUrl: string | null
  explorerLabel: string
  routerAddress: string | null
  nativeSymbol: string
  swapTarget: string | null
}

export function getAssetsByChain(
  document: CanonicalProjectDocument,
  chainId: number,
): CanonicalProjectAsset[] {
  return document.assets.filter((a) => a.chainId === chainId)
}

export function getPrimaryAssetForChain(
  document: CanonicalProjectDocument,
  chainId: number,
): CanonicalProjectAsset | null {
  const onChain = getAssetsByChain(document, chainId)
  return onChain.find((a) => a.projectRole === 'primary') ?? onChain[0] ?? null
}

/** Prefer LIVE deployment; fall back to first primary / first asset. */
export function getPrimaryAsset(document: CanonicalProjectDocument): CanonicalProjectAsset | null {
  const primaries = document.assets.filter((a) => a.projectRole === 'primary')
  const livePrimary = primaries.find((a) => isMelegaChainLive(a.chainId))
  if (livePrimary) return livePrimary
  return primaries[0] ?? document.assets[0] ?? null
}

export function getPrimaryChainLabel(document: CanonicalProjectDocument): string {
  const asset = getPrimaryAsset(document)
  const registry = getMelegaChain(asset?.chainId)
  if (registry) return registry.shortLabel
  const chain = document.chains.find((c) => c.chainId === asset?.chainId) ?? document.chains[0]
  return chain?.label ?? 'Unknown network'
}

export function getPrimaryChainId(document: CanonicalProjectDocument): number | null {
  const asset = getPrimaryAsset(document)
  return asset?.chainId ?? document.chains[0]?.chainId ?? null
}

export function isChartSupported(slug: string, marketsDocument: ProjectMarketsDocument): boolean {
  if (slug === 'marco') return true
  const preferred = marketsDocument.preferredMarkets[0]
  if (
    preferred &&
    (isMarcoSymbol(preferred.baseSymbol) || isMarcoSymbol(preferred.quoteSymbol))
  ) {
    return true
  }
  return marketsDocument.markets.some(
    (m) => isMarcoSymbol(m.baseSymbol) || isMarcoSymbol(m.quoteSymbol),
  )
}

export function getSocialResources(document: CanonicalProjectDocument) {
  return document.resources.filter((r) =>
    ['social', 'github', 'website', 'space'].includes(r.resourceType),
  )
}

export function getPreferredBuyHref(marketsDocument: ProjectMarketsDocument): string | null {
  const preferred = marketsDocument.preferredMarkets[0]
  const preferredBuy =
    (preferred &&
      marketsDocument.swapDestinations.find(
        (d) => d.marketId === preferred.marketId && d.status === 'READY' && d.label.includes('buy'),
      )) ||
    marketsDocument.swapDestinations.find((d) => d.status === 'READY') ||
    null
  return preferredBuy?.href ?? null
}

/** Buy / Trade target — opens the real Swap shell with chain + currencies. */
export function getBuyTokenHref(opts?: { chainId?: number | null; contract?: string | null }): string {
  const params = new URLSearchParams()
  if (opts?.chainId === 8453) {
    params.set('chain', 'base')
    params.set('inputCurrency', 'ETH')
    if (opts.contract) params.set('outputCurrency', opts.contract)
  } else if (opts?.chainId === 42161) {
    params.set('chain', 'arbitrum')
    params.set('inputCurrency', 'ETH')
    if (opts.contract) params.set('outputCurrency', opts.contract)
  } else if (opts?.chainId === 137) {
    params.set('chain', 'polygon')
    params.set('inputCurrency', 'MATIC')
    if (opts.contract) params.set('outputCurrency', opts.contract)
  } else if (opts?.chainId === 43114) {
    params.set('chain', 'avalanche')
    params.set('inputCurrency', 'AVAX')
    if (opts.contract) params.set('outputCurrency', opts.contract)
  } else if (opts?.chainId === 1) {
    params.set('chain', 'eth')
    params.set('inputCurrency', 'ETH')
    if (opts.contract) params.set('outputCurrency', opts.contract)
  } else {
    params.set('chain', 'bsc')
    params.set('inputCurrency', 'BNB')
    if (opts?.contract) params.set('outputCurrency', opts.contract)
  }
  return `/swap?${params.toString()}`
}

/** @deprecated Prefer getBuyTokenHref — Trade CTA removed as primary. */
export function getTradeHref(marketsDocument: ProjectMarketsDocument): string {
  return getPreferredBuyHref(marketsDocument) ?? '/trade'
}

export function explorerBaseUrl(chainId: number | null): string {
  const fromRegistry = getMelegaChain(chainId)?.explorer
  if (fromRegistry) return fromRegistry.replace(/\/$/, '')
  if (chainId === 97) return 'https://testnet.bscscan.com'
  return 'https://bscscan.com'
}

export function explorerUrlFor(address: string, chainId: number | null): string {
  return `${explorerBaseUrl(chainId)}/address/${address}`
}

export function explorerLabelFor(chainId: number | null): string {
  switch (chainId) {
    case 56:
    case 97:
      return 'BscScan'
    case 8453:
      return 'BaseScan'
    case 1:
      return 'Etherscan'
    case 137:
      return 'Polygonscan'
    case 42161:
      return 'Arbiscan'
    case 43114:
      return 'Snowtrace'
    default:
      return 'Explorer'
  }
}

export function shortenRouter(address: string | null): string {
  if (!address || address.length < 12) return address ?? 'Unavailable'
  return `${address.slice(0, 6)}…${address.slice(-4)}`
}

/**
 * Deployments for this project + platform PREPARING chains (Coming soon).
 * LIVE project chains are selectable; PREPARING are visible but disabled.
 */
export function buildProjectChainDeployments(
  document: CanonicalProjectDocument,
): ProjectChainDeployment[] {
  const projectChainIds = new Set<number>([
    ...document.chains.map((c) => c.chainId),
    ...document.assets.map((a) => a.chainId),
  ])

  const rows: ProjectChainDeployment[] = []
  const seen = new Set<number>()

  const push = (chainId: number) => {
    if (seen.has(chainId)) return
    seen.add(chainId)
    const registry = getMelegaChain(chainId)
    const asset = getPrimaryAssetForChain(document, chainId)
    const contract =
      asset?.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(asset.contractAddress)
        ? asset.contractAddress
        : null
    const status: MelegaChainStatus = registry?.status ?? 'DISABLED'
    const live = status === 'LIVE'
    const comingSoon = status === 'PREPARING'
    const router = live ? getMelegaRouterAddress(chainId) : null
    const native = registry?.nativeCurrency.symbol ?? '—'
    rows.push({
      chainId,
      label: registry?.name ?? `Chain ${chainId}`,
      shortLabel: registry?.shortLabel ?? `Chain ${chainId}`,
      status,
      comingSoon,
      asset,
      contractAddress: contract,
      explorerUrl: contract ? explorerUrlFor(contract, chainId) : null,
      explorerLabel: explorerLabelFor(chainId),
      routerAddress: router,
      nativeSymbol: native,
      swapTarget: live && contract ? `${native} → ${asset?.symbol?.value ?? 'Token'}` : null,
    })
  }

  // LIVE project chains first (BNB, Base), then other project chains, then platform PREPARING.
  const liveIds = [...projectChainIds].filter((id) => isMelegaChainLive(id)).sort((a, b) => a - b)
  const otherProject = [...projectChainIds]
    .filter((id) => !isMelegaChainLive(id))
    .sort((a, b) => a - b)
  liveIds.forEach(push)
  otherProject.forEach(push)
  getMelegaPreparingChains().forEach((c: MelegaChainRecord) => push(c.chainId))

  return rows
}

export function defaultSelectedChainId(deployments: ProjectChainDeployment[]): number {
  const withContract = deployments.filter((d) => d.status === 'LIVE' && d.contractAddress)
  // Prefer Melega liquid chains over ETH when multiple LIVE deployments exist.
  for (const preferred of [56, 8453, 137, 42161, 43114, 1]) {
    const hit = withContract.find((d) => d.chainId === preferred)
    if (hit) return hit.chainId
  }
  if (withContract[0]) return withContract[0].chainId
  const anyLive = deployments.find((d) => d.status === 'LIVE')
  return anyLive?.chainId ?? 56
}

export function filterOpportunitiesByChain<T extends { chainId: number | null }>(
  rows: T[],
  chainId: number,
): T[] {
  return rows.filter((r) => r.chainId === chainId)
}

export function filterParticipationByChain(
  rows: ParticipationOpportunityRecord[],
  chainId: number,
): ParticipationOpportunityRecord[] {
  return rows.filter((r) => r.chainId === chainId)
}

export { canonicalProjectPath }
