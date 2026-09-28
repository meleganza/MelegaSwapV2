/** Stable public refs mirrored by MARCO's authoritative product catalogue. */
export const DEX_REFERRAL_CATALOG_BY_PACKAGE: Readonly<Record<string, string>> = {
  featured_24h: 'mpp_ref_dex_featured_24h',
  featured_72h: 'mpp_ref_dex_featured_72h',
  featured_1w: 'mpp_ref_dex_featured_1w',
  featured_1m: 'mpp_ref_dex_featured_1m',
  trend_1h: 'mpp_ref_dex_trend_1h',
  trend_3h: 'mpp_ref_dex_trend_3h',
  trend_6h: 'mpp_ref_dex_trend_6h',
  trend_12h: 'mpp_ref_dex_trend_12h',
  trend_24h: 'mpp_ref_dex_trend_24h',
}

export function dexReferralCatalogRef(packageId: string | null | undefined): string | null {
  return packageId ? DEX_REFERRAL_CATALOG_BY_PACKAGE[packageId] ?? null : null
}

