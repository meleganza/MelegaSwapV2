import { assertPassportProEconomics, PASSPORT_PRO_COMMISSION_ASSET } from 'lib/marco-pay/economics'

/**
 * MARCO Passport PRO referral transport for Melega DEX.
 *
 * The referral code remains owned and verified by marco.melega.ai. This file
 * only carries the canonical `?ref=` value across DEX navigation and exposes a
 * verified code to checkout. It never calculates discounts or commissions.
 */

export const MARCO_REFERRAL_QUERY_PARAM = 'ref'
export const MARCO_REFERRAL_DESTINATION_PARAM = 'rd'
export const MARCO_REFERRAL_CAMPAIGN_PARAM = 'rc'
export const MARCO_REFERRAL_STORAGE_KEY = 'marco.passport-pro.referral.v1'
export const MARCO_REFERRAL_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000
export const MARCO_REFERRAL_CHANGE_EVENT = 'marco:referral-change'
export const MARCO_REFERRAL_AUTHORITY = 'https://marco.melega.ai'
export const MELEGA_DEX_REFERRAL_SURFACE = 'melega-dex'

const CODE_PATTERN = /^[a-z0-9][a-z0-9-]{1,30}[a-z0-9]$/

export type StoredMarcoReferral = {
  code: string
  capturedAt: number
  expiresAt: number
  verifiedAt: number | null
  status: 'PENDING' | 'VERIFIED'
  destinationRef?: string | null
  campaignRef?: string | null
}

export type ReferralStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

type ReferralResolvePayload = {
  ok?: boolean
  referral_code?: string
  valid?: boolean
  pro_certified?: boolean
  certified_surfaces?: unknown
}

export function normalizeMarcoReferralCode(value: unknown): string | null {
  const code = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return CODE_PATTERN.test(code) ? code : null
}

/** Authority code wins only when it is the same referral the customer presented. */
export function canonicalReferralCode(
  body: { canonical_code?: unknown; referral_code?: unknown; code?: unknown },
  requested: string,
): string | null {
  const expected = normalizeMarcoReferralCode(requested)
  if (!expected) return null
  for (const candidate of [body.canonical_code, body.referral_code, body.code]) {
    const canonical = normalizeMarcoReferralCode(candidate)
    if (canonical && canonical === expected) return canonical
  }
  return null
}

function normalizeAnalyticsContext(value: unknown): string | null {
  const context = typeof value === 'string' ? value.trim().toLowerCase() : ''
  return /^[a-z0-9][a-z0-9._-]{0,63}$/.test(context) ? context : null
}

/** Storage is optional: privacy modes and embedded browsers may deny access. */
export function getBrowserMarcoReferralStorage(): ReferralStorage | null {
  try {
    const storage = typeof window !== 'undefined' ? window.localStorage : null
    return storage &&
      typeof storage.getItem === 'function' &&
      typeof storage.setItem === 'function' &&
      typeof storage.removeItem === 'function'
      ? storage
      : null
  } catch {
    return null
  }
}

function removeStoredMarcoReferral(storage: ReferralStorage): void {
  try {
    storage.removeItem(MARCO_REFERRAL_STORAGE_KEY)
  } catch {
    // Referral attribution must never break the host checkout.
  }
}

export function readStoredMarcoReferral(
  storage: ReferralStorage,
  now = Date.now(),
): StoredMarcoReferral | null {
  try {
    const raw = storage.getItem(MARCO_REFERRAL_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<StoredMarcoReferral>
    const code = normalizeMarcoReferralCode(parsed.code)
    if (!code || !Number.isFinite(parsed.expiresAt) || Number(parsed.expiresAt) <= now) {
      storage.removeItem(MARCO_REFERRAL_STORAGE_KEY)
      return null
    }
    return {
      code,
      capturedAt: Number(parsed.capturedAt) || now,
      expiresAt: Number(parsed.expiresAt),
      verifiedAt: Number.isFinite(parsed.verifiedAt) ? Number(parsed.verifiedAt) : null,
      status: parsed.status === 'VERIFIED' ? 'VERIFIED' : 'PENDING',
      destinationRef: normalizeAnalyticsContext(parsed.destinationRef),
      campaignRef: normalizeAnalyticsContext(parsed.campaignRef),
    }
  } catch {
    removeStoredMarcoReferral(storage)
    return null
  }
}

/** First valid touch wins for 30 days. A later URL cannot overwrite it. */
export function captureMarcoReferral(
  href: string,
  storage: ReferralStorage,
  now = Date.now(),
): StoredMarcoReferral | null {
  const existing = readStoredMarcoReferral(storage, now)
  if (existing) return existing

  try {
    const url = new URL(href)
    const code = normalizeMarcoReferralCode(url.searchParams.get(MARCO_REFERRAL_QUERY_PARAM))
    if (!code) return null
    const captured: StoredMarcoReferral = {
      code,
      capturedAt: now,
      expiresAt: now + MARCO_REFERRAL_MAX_AGE_MS,
      verifiedAt: null,
      status: 'PENDING',
      destinationRef: normalizeAnalyticsContext(url.searchParams.get(MARCO_REFERRAL_DESTINATION_PARAM)),
      campaignRef: normalizeAnalyticsContext(url.searchParams.get(MARCO_REFERRAL_CAMPAIGN_PARAM)),
    }
    storage.setItem(MARCO_REFERRAL_STORAGE_KEY, JSON.stringify(captured))
    return captured
  } catch {
    return null
  }
}

export async function verifyMarcoReferral(
  referral: StoredMarcoReferral,
  storage: ReferralStorage,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<StoredMarcoReferral | null> {
  try {
    const endpoint = new URL('/api/public/referral/resolve', MARCO_REFERRAL_AUTHORITY)
    endpoint.searchParams.set('code', referral.code)
    const response = await fetchImpl(endpoint.toString(), {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal:
        typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
          ? AbortSignal.timeout(5_000)
          : undefined,
    })
    const payload = (await response.json()) as ReferralResolvePayload
    const surfaces = Array.isArray(payload.certified_surfaces) ? payload.certified_surfaces : []
    const verified =
      response.ok &&
      payload.ok === true &&
      payload.valid === true &&
      payload.pro_certified === true &&
      payload.referral_code === referral.code &&
      surfaces.includes(MELEGA_DEX_REFERRAL_SURFACE)
    if (!verified) {
      removeStoredMarcoReferral(storage)
      return null
    }
    const next: StoredMarcoReferral = {
      ...referral,
      status: 'VERIFIED',
      verifiedAt: now,
    }
    storage.setItem(MARCO_REFERRAL_STORAGE_KEY, JSON.stringify(next))
    return next
  } catch {
    // Transport failure is never a checkout dependency. A previously verified,
    // unexpired first touch remains usable and MARCO re-verifies it server-side.
    return referral.status === 'VERIFIED' && referral.expiresAt > now ? referral : null
  }
}

export async function resolveMarcoReferralForCheckout(
  storage: ReferralStorage,
  fetchImpl: typeof fetch = fetch,
  now = Date.now(),
): Promise<StoredMarcoReferral | null> {
  const stored = readStoredMarcoReferral(storage, now)
  if (!stored) return null
  return verifyMarcoReferral(stored, storage, fetchImpl, now)
}

export type MarcoReferralQuote = {
  referral_code: string
  catalog_ref: string
  listed_price_minor: string
  discount_minor: string
  net_paid_minor: string
  commission_amount_minor: string
  commission_asset: typeof PASSPORT_PRO_COMMISSION_ASSET
}

/** Server-side pre-payment quote. Exact integer facts come only from Passport. */
export async function quoteMarcoReferralForCheckout(input: {
  code: string
  catalogRef: string
  destinationRef?: string | null
  campaignRef?: string | null
  fetchImpl?: typeof fetch
}): Promise<MarcoReferralQuote | null> {
  const endpoint = new URL('/api/public/referral/quote', MARCO_REFERRAL_AUTHORITY)
  endpoint.searchParams.set('code', input.code)
  endpoint.searchParams.set('catalog_ref', input.catalogRef)
  if (input.destinationRef) endpoint.searchParams.set('rd', input.destinationRef)
  if (input.campaignRef) endpoint.searchParams.set('rc', input.campaignRef)
  try {
    const response = await (input.fetchImpl ?? fetch)(endpoint.toString(), {
      headers: { accept: 'application/json' },
      cache: 'no-store',
      signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function'
        ? AbortSignal.timeout(6_000)
        : undefined,
    })
    const body = (await response.json()) as Partial<MarcoReferralQuote> & {
      ok?: boolean
      canonical_code?: string
      code?: string
      commission_amount_base?: string
      commission_asset?: string
    }
    const canonical = canonicalReferralCode(body, input.code)
    const commissionAmountMinor =
      typeof body.commission_amount_base === 'string' && /^\d+$/.test(body.commission_amount_base)
        ? body.commission_amount_base
        : body.commission_amount_minor
    if (
      !response.ok ||
      body.ok !== true ||
      !canonical ||
      body.catalog_ref !== input.catalogRef ||
      typeof body.listed_price_minor !== 'string' ||
      typeof body.discount_minor !== 'string' ||
      typeof body.net_paid_minor !== 'string' ||
      typeof commissionAmountMinor !== 'string'
    ) {
      return null
    }
    if (
      typeof body.commission_amount_base === 'string' &&
      typeof body.commission_amount_minor === 'string' &&
      body.commission_amount_base !== body.commission_amount_minor
    ) {
      return null
    }
    try {
      const economics = assertPassportProEconomics({
        listedPriceMinor: body.listed_price_minor,
        discountMinor: body.discount_minor,
        netPaidMinor: body.net_paid_minor,
        commissionAmountMinor,
        commissionAsset: body.commission_asset,
      })
      return {
        referral_code: canonical,
        catalog_ref: input.catalogRef,
        listed_price_minor: economics.listedPriceMinor,
        discount_minor: economics.discountMinor,
        net_paid_minor: economics.netPaidMinor,
        commission_amount_minor: economics.commissionAmountMinor,
        commission_asset: economics.commissionAsset,
      }
    } catch {
      return null
    }
  } catch {
    return null
  }
}
