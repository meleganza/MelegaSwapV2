import type { DexAssetRecord } from './types'

const LOCAL_LOGO_PREFIX = '/images/56/tokens/'

/** Resolve logo URI with explicit fallback — never emit broken relative paths. */
export function resolveAssetLogo(address?: string, logoURI?: string): { logo?: string; logoFallback: 'initials' | 'generic' } {
  if (logoURI?.startsWith('http') || logoURI?.startsWith('/')) {
    return { logo: logoURI, logoFallback: 'initials' }
  }
  if (address && /^0x[a-f0-9]{40}$/i.test(address)) {
    return { logo: `${LOCAL_LOGO_PREFIX}${address.toLowerCase()}.png`, logoFallback: 'initials' }
  }
  return { logoFallback: 'generic' }
}

export function mergeAssetSurfaces(
  existing: DexAssetRecord['surfaces'],
  patch: Partial<DexAssetRecord['surfaces']>,
): DexAssetRecord['surfaces'] {
  return {
    trade: existing.trade || Boolean(patch.trade),
    pool: existing.pool || Boolean(patch.pool),
    farm: existing.farm || Boolean(patch.farm),
    project: existing.project || Boolean(patch.project),
    radar: existing.radar || Boolean(patch.radar),
    trending: existing.trending || Boolean(patch.trending),
  }
}

export function assetKey(chainId: number, address?: string, symbol?: string): string {
  if (address) return `${chainId}:${address.toLowerCase()}`
  return `${chainId}:sym:${(symbol ?? 'unknown').toUpperCase()}`
}
