import { isMarcoSymbol } from 'design-system/melega/constants/brand'
import { canonicalProjectPath } from 'registry/projects/identity'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'

export function getPrimaryAsset(document: CanonicalProjectDocument) {
  const primary = document.assets.filter((a) => a.projectRole === 'primary')
  return primary[0] ?? document.assets[0] ?? null
}

export function getPrimaryChainLabel(document: CanonicalProjectDocument): string {
  const asset = getPrimaryAsset(document)
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

export function getRelatedProjectHref(slug: string): string | null {
  if (slug === 'marco') return canonicalProjectPath('melega-dex')
  if (slug === 'melega-dex') return canonicalProjectPath('marco')
  return null
}

export function getRelatedProjectLabel(slug: string): string | null {
  if (slug === 'marco') return 'Melega DEX'
  if (slug === 'melega-dex') return 'MARCO'
  return null
}

export function getSocialResources(document: CanonicalProjectDocument) {
  return document.resources.filter((r) =>
    ['social', 'github', 'website', 'space'].includes(r.resourceType),
  )
}

export function getBuySectionTitle(slug: string, symbol: string | null): string {
  if (slug === 'marco') return 'Buy MARCO'
  if (symbol) return `Buy ${symbol}`
  return 'Buy'
}

export function getBuyCtaLabel(slug: string, symbol: string | null): string {
  return getBuySectionTitle(slug, symbol)
}

export function humanProvenanceLabel(provenance: string): string {
  if (/ON_CHAIN|ONCHAIN/i.test(provenance)) return 'On-chain'
  if (/PROJECT|DECLARED|ATTESTED/i.test(provenance)) return 'Declared by project'
  return provenance
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

/**
 * UX003 — token-project website template vs protocol template.
 * Derived from registered primary asset + projectType — never slug hacks.
 */
export function isTokenProjectTemplate(document: CanonicalProjectDocument): boolean {
  const primary = getPrimaryAsset(document)
  const hasTradablePrimary =
    Boolean(primary?.contractAddress) &&
    (primary?.projectRole === 'primary' || primary?.projectRole === 'secondary')
  const typeLabel =
    document.identity.projectType?.meta.availability === 'AVAILABLE'
      ? String(document.identity.projectType.value ?? '')
      : ''
  if (/exchange|protocol|infrastructure|platform/i.test(typeLabel) && !hasTradablePrimary) {
    return false
  }
  return hasTradablePrimary
}

export function getProjectTypeLabel(document: CanonicalProjectDocument): string | null {
  if (document.identity.projectType?.meta.availability !== 'AVAILABLE') return null
  return document.identity.projectType.value ? String(document.identity.projectType.value) : null
}

export function getWebsiteResource(document: CanonicalProjectDocument) {
  return getSocialResources(document).find((r) => r.resourceType === 'website' && Boolean(r.url))
}
