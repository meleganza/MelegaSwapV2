/**
 * DEX products published LIVE by the Passport manifest
 * (`work_with_marco` on GET /api/public/machine/manifest, audited 2026-10-21).
 * Other DEX packages stay on sale at their listed price and are not given
 * invented catalog refs.
 */
export const PASSPORT_PUBLISHED_DEX_CATALOG = {
  trend_6h: { catalogRef: 'mpp_ref_dex_trend_6h', listedUsdMinor: '2900' },
  featured_1w: { catalogRef: 'mpp_ref_dex_featured_1w', listedUsdMinor: '9900' },
} as const

export const DEX_REFERRAL_CATALOG_BY_PACKAGE: Readonly<Record<string, string>> = {
  trend_6h: PASSPORT_PUBLISHED_DEX_CATALOG.trend_6h.catalogRef,
  featured_1w: PASSPORT_PUBLISHED_DEX_CATALOG.featured_1w.catalogRef,
}

export function dexReferralCatalogRef(packageId: string | null | undefined): string | null {
  return packageId ? DEX_REFERRAL_CATALOG_BY_PACKAGE[packageId] ?? null : null
}

